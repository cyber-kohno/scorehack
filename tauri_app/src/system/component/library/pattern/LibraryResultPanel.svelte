<script lang="ts">
  import { get } from "svelte/store";
  import { onDestroy, tick } from "svelte";
  import ChordTheory from "../../../domain/theory/chord-theory";
  import FinderState from "../../../store/state/data/arrange/finder-state";
  import ScrollRateFrame from "../../common/ScrollRateFrame.svelte";
  import { controlStore, dataStore, libraryStore, refStore } from "../../../store/global-store";
  import FinderConditionHeader from "../../arrange/finder/condition/FinderConditionHeader.svelte";
  import APFinderPresetItem from "../../arrange/finder/list/piano/APFinderPresetItem.svelte";
  import ADFinderExistMark from "../../arrange/finder/list/drum/ADFinderExistMark.svelte";
  import ADFinderPatternItem from "../../arrange/finder/list/drum/ADFinderPatternItem.svelte";
  import AGFinderBackingThumbnail from "../../arrange/finder/list/guitar/AGFinderBackingThumbnail.svelte";
  import AGFinderVoicingThumbnail from "../../arrange/finder/list/guitar/AGFinderVoicingThumbnail.svelte";

  let listRef: HTMLElement | null = null;
  let recordRefs: HTMLElement[] = [];

  const syncRecordRefs = (length: number) => {
    const refState = get(refStore);
    refState.library.finder.frame = listRef ?? undefined;
    refState.library.finder.records = recordRefs
      .slice(0, length)
      .map((ref, seq) => ({ seq, ref }))
      .filter(item => item.ref != undefined);
    refStore.set({ ...refState });
  };

  const clearRecordRefs = () => {
    const refState = get(refStore);
    refState.library.finder.frame = undefined;
    refState.library.finder.records = [];
    refStore.set({ ...refState });
  };

  onDestroy(clearRecordRefs);

  const createStructCount = (library: NonNullable<typeof $libraryStore>) => {
    const condition = library.condition;
    const chord = {
      key12: condition.root,
      isFlat: false,
      symbol: condition.symbol,
      on: condition.on === -1
        ? undefined
        : {
          key12: condition.on,
          isFlat: false,
        },
    };

    return ChordTheory.getStructsFromKeyChord(chord).length;
  };

  $: track = $dataStore.arrange.tracks[$controlStore.outline.trackIndex];
  $: pianoFinder = (() => {
    const library = $libraryStore;
    if (library == null || track == undefined) return null;
    if (track.method !== "piano") return null;

    const condition = library.condition;
    const request: FinderState.SearchRequest = {
      ts: condition.ts,
      beat: condition.beat,
      eatHead: condition.eatHead,
      eatTail: condition.eatTail,
      structCnt: createStructCount(library),
    };

    return {
      request,
      cursor: library.focus.finder?.cursor ?? { backing: -1, sounds: -1 },
      apply: { backing: -1, sounds: -1 },
      list: FinderState.searchPianoPatterns({
        req: request,
        arrTrack: track,
        isFilterPatternOnly: false,
      }),
    };
  })();

  $: drumFinder = (() => {
    const library = $libraryStore;
    if (library == null || track == undefined) return null;
    if (track.method !== "drum") return null;

    const condition = library.condition;
    const request: FinderState.SearchRequest = {
      ts: condition.ts,
      beat: condition.beat,
      eatHead: condition.eatHead,
      eatTail: condition.eatTail,
      structCnt: 0,
    };

    return {
      request,
      cursor: library.focus.finder?.cursor.backing ?? -1,
      apply: -1,
      list: FinderState.Drum.searchPatterns({
        req: request,
        arrTrack: track,
      }),
    };
  })();
  $: guitarFinder = (() => {
    const library = $libraryStore;
    if (library == null || track == undefined) return null;
    if (track.method !== "guitar") return null;

    const condition = library.condition;
    const request: FinderState.SearchRequest = {
      ts: condition.ts,
      beat: condition.beat,
      eatHead: condition.eatHead,
      eatTail: condition.eatTail,
      structCnt: 0,
    };
    const chord = {
      key12: condition.root,
      isFlat: false,
      symbol: condition.symbol,
      on: condition.on === -1
        ? undefined
        : {
          key12: condition.on,
          isFlat: false,
        },
    };
    const key = FinderState.Guitar.createVoicingKey(chord);
    const cursor = (() => {
      const cursor = library.focus.finder?.cursor;
      if (cursor == undefined || !("target" in cursor)) {
        return {
          target: "voicing",
          voicing: 0,
          backing: 0,
          sounds: -1,
        };
      }
      return {
        target: cursor.target ?? "voicing",
        voicing: cursor.voicing ?? 0,
        backing: cursor.backing,
        sounds: cursor.sounds,
      };
    })();

    return {
      request,
      key,
      cursor,
      apply: { voicing: -1, backing: -1 },
      voicings: FinderState.Guitar.searchVoicings({
        key,
        arrTrack: track,
      }),
      backings: FinderState.Guitar.searchBackings({
        req: request,
        arrTrack: track,
      }),
    };
  })();

  $: request = pianoFinder?.request ?? drumFinder?.request ?? guitarFinder?.request ?? null;
  $: chordName = guitarFinder == null
    ? undefined
    : ChordTheory.getKeyChordName({
      key12: guitarFinder.key.root,
      symbol: guitarFinder.key.symbol,
      isFlat: false,
      on: guitarFinder.key.on == null
        ? undefined
        : {
          key12: guitarFinder.key.on,
          isFlat: false,
        },
    });
  $: cursorIndex = (() => {
    if (pianoFinder != null) return pianoFinder.cursor.backing;
    if (drumFinder != null) return drumFinder.cursor;
    if (guitarFinder != null) {
      return guitarFinder.cursor.target === "voicing"
        ? guitarFinder.cursor.voicing
        : guitarFinder.cursor.backing;
    }
    return -1;
  })();
  $: listLength = pianoFinder?.list.length
    ?? drumFinder?.list.length
    ?? ((guitarFinder?.voicings.length ?? 0) + (guitarFinder?.backings.length ?? 0));
  $: isDrumRegular = (patternNo: number) => {
    return track?.method === "drum" && track.bank.regulars.some(regular => {
      return regular.patternNo === patternNo;
    });
  };
  $: getDrumPattern = (patternNo: number) => {
    if (track?.method !== "drum") throw new Error("Drum track must exist.");
    const pattern = track.bank.patterns.find(pattern => pattern.no === patternNo);
    if (pattern == undefined) throw new Error("Drum pattern must exist.");
    return pattern;
  };
  $: getGuitarVoicing = (voicingNo: number) => {
    if (track?.method !== "guitar") throw new Error("Guitar track must exist.");
    return FinderState.Guitar.getVoicingFromNo(voicingNo, track.bank);
  };
  $: getGuitarBacking = (backingNo: number) => {
    if (track?.method !== "guitar") throw new Error("Guitar track must exist.");
    return FinderState.Guitar.getBackingFromNo(backingNo, track.bank);
  };
  $: getGuitarItemClass = (
    target: FinderState.Guitar.Cursor["target"],
    index: number,
    isRegular: boolean,
  ) => {
    if (guitarFinder == null) return "";
    const isFocus = guitarFinder.cursor.target === target && guitarFinder.cursor[target] === index;
    return [
      "guitar-item",
      isFocus ? "focus" : "",
      isRegular ? "regular" : "",
    ].filter(Boolean).join(" ");
  };
  $: isGuitarVoicingRegular = (voicingNo: number) => {
    return track?.method === "guitar" && track.bank.voicingRegulars.some(regular => {
      return regular.voicingNo === voicingNo;
    });
  };
  $: isGuitarBackingRegular = (backingNo: number) => {
    return track?.method === "guitar" && track.bank.backingRegulars.some(regular => {
      return regular.backingNo === backingNo;
    });
  };

  $: {
    tick().then(() => syncRecordRefs(listLength));
  }
</script>

<div class="panel">
  {#if request != null && track != undefined}
    <FinderConditionHeader {request} method={track.method} {chordName} />
  {:else}
    <div class="condition-placeholder"></div>
  {/if}
  <div class="list-base">
    <ScrollRateFrame
      ref={listRef}
      dir={"y"}
      frameLength={300}
      frameWidth={10}
      dependencies={[cursorIndex]}
    />
    {#if track == undefined}
      <div class="msg">No arrange track found.</div>
    {:else if track.method !== "piano" && track.method !== "drum" && track.method !== "guitar"}
      <div class="msg">Arrange patterns are not available for this track.</div>
    {:else if listLength === 0}
      <div class="msg">No matching presets found.</div>
    {:else}
      <div class="list-inner" bind:this={listRef}>
        {#if track.method === "drum" && drumFinder != null}
          <div class="drum-grid">
            {#each drumFinder.list as item, patternIndex}
              <div class="drum-cell record-ref" bind:this={recordRefs[patternIndex]}>
                <ADFinderPatternItem
                  finder={drumFinder}
                  {item}
                  index={patternIndex}
                  pattern={getDrumPattern(item.patternNo)}
                  mappings={track.bank.mappings}
                  isRegular={isDrumRegular(item.patternNo)}
                />
              </div>
            {/each}
          </div>
        {:else if track.method === "guitar" && guitarFinder != null}
          <div class="guitar-finder">
            <div class:active-section={guitarFinder.cursor.target === "voicing"} class="guitar-section voicing">
              <div class="guitar-title">Voicing</div>
              <div class="guitar-grid">
                {#each guitarFinder.voicings as item, index}
                  <div
                    class={getGuitarItemClass("voicing", index, isGuitarVoicingRegular(item.voicingNo))}
                    bind:this={recordRefs[index]}
                  >
                    <ADFinderExistMark isRegular={isGuitarVoicingRegular(item.voicingNo)} />
                    {#if item.voicingNo === -1}
                      None
                    {:else}
                      {@const voicing = getGuitarVoicing(item.voicingNo)}
                      <div class="guitar-item-label">#{item.voicingNo}</div>
                      <div class="guitar-thumbnail">
                        <AGFinderVoicingThumbnail frets={voicing.frets} />
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
            <div class:active-section={guitarFinder.cursor.target === "backing"} class="guitar-section backing">
              <div class="guitar-title">Backing</div>
              <div class="guitar-grid">
                {#each guitarFinder.backings as item, index}
                  <div
                    class={getGuitarItemClass("backing", index, isGuitarBackingRegular(item.backingNo))}
                    bind:this={recordRefs[guitarFinder.voicings.length + index]}
                  >
                    <ADFinderExistMark isRegular={isGuitarBackingRegular(item.backingNo)} />
                    {#if item.backingNo === -1}
                      None
                    {:else}
                      {@const backing = getGuitarBacking(item.backingNo)}
                      <div class="guitar-item-label">#{item.backingNo}</div>
                      <div class="guitar-thumbnail">
                        <AGFinderBackingThumbnail backing={backing.backing} ts={guitarFinder.request.ts} />
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {:else if pianoFinder != null}
          {#each pianoFinder.list as preset, backingIndex}
            <div class="record-ref" bind:this={recordRefs[backingIndex]}>
              <APFinderPresetItem finder={pianoFinder} usageBkg={preset} {backingIndex} />
            </div>
          {/each}
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .panel {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
    background-color: rgb(0, 0, 0);
    overflow: hidden;
  }

  .condition-placeholder {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 40px;
    background-color: #0d263a;
  }

  .list-base {
    display: inline-block;
    position: relative;
    width: 100%;
    height: calc(100% - 40px);
  }

  .list-inner {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
    background-color: rgb(44, 44, 44);
    overflow: hidden;
  }

  .record-ref {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 71px;
  }

  .drum-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    position: relative;
    width: 100%;
  }

  .drum-cell {
    width: 100%;
  }

  .guitar-finder {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
    padding: 0;
    box-sizing: border-box;
  }

  .guitar-section {
    display: block;
    position: relative;
    width: 100%;
    padding: 5px 6px 7px;
    box-sizing: border-box;
    overflow: hidden;
    background-color: rgba(82, 91, 112, 0.34);
  }

  .guitar-section.voicing {
    height: 162px;
  }

  .guitar-section.backing {
    height: calc(100% - 162px);
  }

  .guitar-section.active-section {
    background-color: rgba(114, 130, 154, 0.58);
  }

  .guitar-title {
    display: block;
    width: 100%;
    height: 22px;
    color: rgba(214, 247, 255, 0.84);
    font-size: 14px;
    font-weight: 800;
    line-height: 22px;
  }

  .guitar-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    width: 100%;
  }

  .guitar-item {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    height: 58px;
    border: 1px solid rgba(120, 169, 182, 0.58);
    box-sizing: border-box;
    background-color: rgba(98, 122, 142, 0.72);
    color: rgba(242, 252, 255, 0.84);
    font-size: 16px;
    font-weight: 800;
    overflow: hidden;
  }

  .guitar-item.focus {
    border-color: #ff382e;
    outline: 2px solid #ff382e;
    outline-offset: -2px;
    background-color: rgba(143, 125, 88, 0.85);
  }

  .guitar-item.regular {
    background-color: rgba(74, 74, 18, 0.92);
  }

  .guitar-item-label {
    display: inline-block;
    position: absolute;
    left: 4px;
    top: 3px;
    z-index: 1;
    height: 12px;
    color: rgba(235, 250, 255, 0.78);
    font-size: 10px;
    font-weight: 800;
    line-height: 12px;
  }

  .guitar-thumbnail {
    display: inline-block;
    position: absolute;
    left: 8px;
    right: 8px;
    top: 16px;
    bottom: 7px;
  }

  .msg {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 30px;
    padding: 0 0 0 4px;
    box-sizing: border-box;
    color: rgba(255, 255, 255, 0.658);
    font-size: 18px;
    font-weight: 600;
    line-height: 22px;
  }
</style>
