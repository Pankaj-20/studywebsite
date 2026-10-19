(function () {
  "use strict";
  var T = {
    mlfq: "MLFQ (Ch 8)", share: "Proportional share (Ch 9)", as: "Address spaces & API (Ch 13–14)",
    seg: "Translation & segmentation (Ch 15–16)", free: "Free space (Ch 17)", pg: "Paging & TLBs (Ch 18–19)",
    ml: "Multi-level tables (Ch 20)", swap: "Beyond RAM (Ch 21–22)", p2: "P2 cachelab"
  };

  // Each MCQ: t = topic, s = setup (HTML), st = [statement HTML, true/false, explanation]
  var MCQ = [
    { t: "mlfq", s: "An MLFQ scheduler has three queues (Q2 highest). The allotment is 20 ms at every level, the Q2 quantum is 10 ms, and all jobs are boosted every 200 ms. CPU-bound job A arrives at t = 0.",
      st: [
        ["A is placed in Q2 when it arrives.", true, "Rule 3: new jobs enter at the highest priority."],
        ["If A runs 10 ms, blocks briefly for I/O, then runs another 10 ms at Q2, it is demoted after the second burst.", true, "Rule 4 counts cumulative CPU at a level: 10 + 10 = 20 ms uses the allotment, regardless of the yield in between."],
        ["At the 200 ms boost, only jobs that have been starving move back to Q2.", false, "The boost is global: every job moves to the top queue."],
        ["MLFQ guarantees A at least one third of the CPU because there are three queues.", false, "MLFQ ranks urgency; it doesn't guarantee any CPU share."]
      ] },
    { t: "mlfq", s: "Consider how MLFQ's rules evolved and what the final design achieves.",
      st: [
        ["Under the original Rules 4a/4b (usage resets whenever a job gives up the CPU), a job that runs 99% of each quantum and then does trivial I/O can stay at top priority.", true, "That's the gaming attack. The rewritten Rule 4 fixes it with cumulative accounting."],
        ["Lower-priority queues must use longer quanta than higher ones.", false, "Longer low-priority quanta are common but a design choice, not a rule."],
        ["MLFQ approximates SJF because short jobs tend to finish before they are demoted far.", true, "Short jobs complete near the top; long CPU-bound jobs reveal themselves and sink."],
        ["Interactive jobs tend to stay at high priority because they use short bursts and block for I/O, consuming their allotment slowly.", true, "Exactly why MLFQ gives them good response."]
      ] },
    { t: "mlfq", s: "Two queues: Q1 (high; quantum 10 ms, allotment 10 ms) and Q0 (low; quantum 20 ms). No boost occurs. A demoted job joins the tail of the lower queue, and an arriving higher-priority job preempts immediately. CPU-bound A needs 50 ms and arrives at t = 0. CPU-bound B needs 15 ms and arrives at t = 10.",
      st: [
        ["B begins running at t = 10.", true, "A was demoted to Q0 at t = 10; B enters Q1, which is higher, so B runs."],
        ["B completes at t = 45.", true, "B runs 10–20 (demoted), A runs 20–40 in Q0, B runs its last 5 ms 40–45."],
        ["A completes at t = 65.", true, "A has 20 ms left after 40 and runs 45–65 alone."],
        ["At t = 15, A and B have the same priority.", false, "At t = 15, B is in Q1 and A is in Q0."]
      ] },
    { t: "share", s: "Lottery scheduling with three runnable jobs: A has 300 tickets, B has 100, C has 100.",
      st: [
        ["A's target share is 60%.", true, "300 ÷ 500 = 60%."],
        ["Over any 10 consecutive drawings, A wins exactly 6.", false, "Lottery is probabilistic; short runs can deviate from the target."],
        ["If C exits, A's target share becomes 75%.", true, "300 ÷ 400 = 75%."],
        ["Doubling every job's ticket count changes their target shares.", false, "Only ratios matter."]
      ] },
    { t: "share", s: "A owns lottery tickets 0–74 and B owns 75–99. User U holds 100 global tickets and gives job U1 300 and job U2 100 tickets in U's own currency.",
      st: [
        ["A drawing of 74 selects A.", true, "74 lies in A's range 0–74."],
        ["A drawing of 75 selects A.", false, "75 is B's first ticket."],
        ["Lottery must repair accumulated per-job state whenever a job arrives.", false, "Lottery has no accumulated state; a newcomer's tickets just join the next drawing."],
        ["U1 holds 75 global tickets.", true, "300 ÷ 400 of U's 100 global tickets = 75."]
      ] },
    { t: "share", s: "Stride scheduling with constant 10,000: A has 100 tickets, B has 50, C has 250. All pass values start at 0, and ties go to A, then B, then C.",
      st: [
        ["The fourth job selected is C.", true, "Sequence: A, B, C, C, C, A, C, C, …"],
        ["After eight selections, C's pass value is 200.", true, "C ran 5 times × stride 40 = 200."],
        ["After eight selections, A has run twice and B once.", true, "2 : 1 : 5 matches 100 : 50 : 250."],
        ["The ninth selection is A.", true, "All passes are 200 after eight picks; the tie goes to A."]
      ] },
    { t: "share", s: "Statements about stride scheduling.",
      st: [
        ["A job with more tickets has a larger stride.", false, "Stride = constant ÷ tickets, so more tickets means a smaller stride."],
        ["The scheduler always runs the runnable job with the smallest pass value.", true, "Then adds that job's stride to its pass."],
        ["A new job inserted with pass 0 while others have passes near 10,000 would monopolize the CPU for a while.", true, "That's the new-arrival problem; it needs a sensible initial pass."],
        ["Stride keeps no per-job state beyond the ticket count.", false, "Each job keeps a pass value, which is exactly what makes dynamic membership tricky."]
      ] },
    { t: "share", s: "A CFS-style scheduler uses <code>vruntime += runtime × default_weight ÷ weight</code> with default_weight = 1024. Task A has weight 2048; task B has weight 1024. Each runs 10 ms of real time.",
      st: [
        ["A's vruntime increases by 5 ms.", true, "10 × 1024 ÷ 2048 = 5."],
        ["B's vruntime increases by 10 ms.", true, "10 × 1024 ÷ 1024 = 10."],
        ["The scheduler next picks the task with the larger vruntime.", false, "CFS runs the smallest vruntime."],
        ["Over time, A receives about twice as much CPU time as B.", true, "Its vruntime grows half as fast, so it's selected about twice as often."]
      ] },
    { t: "share", s: "Comparing scheduling objectives.",
      st: [
        ["Proportional-share scheduling minimizes average turnaround time.", false, "It targets weighted fairness; turnaround is a different objective."],
        ["Lottery outcomes can differ substantially from the target over a short run but converge over many drawings.", true, "Fairness is probabilistic; unfairness U approaches 1 for long jobs."],
        ["In CFS, niceness is a fixed-priority queue level.", false, "Niceness maps to a weight used in proportional accounting."],
        ["MLFQ guarantees each job a fair share of the CPU.", false, "MLFQ ranks urgency and can starve without boosts; it makes no share guarantee."]
      ] },
    { t: "as", s: "A process prints the address of a local variable and sees 0x3FFC. Its address space is 16 KB.",
      st: [
        ["0x3FFC is the physical RAM address of the variable.", false, "Every address a user program sees is virtual."],
        ["The 12 KB unused gap between heap and stack necessarily occupies 12 KB of physical memory.", false, "Whether the gap uses RAM depends on the mechanism; segmentation and paging need not back it."],
        ["The process's malloc chooses which physical frames hold heap data.", false, "A user-level allocator manages blocks inside the virtual address space."],
        ["Another process can also use virtual address 0x3FFC for different data.", true, "Hardware translates each process's addresses separately."]
      ] },
    { t: "as", s: "The OS virtualizes memory with three goals: transparency, efficiency, protection.",
      st: [
        ["Transparency means a program uses the same addresses wherever the OS places it in RAM.", true, "The mechanism is invisible to the program."],
        ["Efficiency covers both time overhead and space overhead.", true, "Translation must be fast and its bookkeeping must not use too much RAM."],
        ["Protection is unnecessary if programmers write correct code.", false, "Nontrivial code has bugs, and some code is malicious. Hardware must enforce isolation."],
        ["Fast translation needs hardware support because translating every access in software would be far too slow.", true, "Memory accesses happen on nearly every instruction."]
      ] },
    { t: "as", s: "<pre><code>int *p = malloc(4 * sizeof(int));\nfree(p);\nprintf(\"%d\\n\", p[0]);      /* line 3 */\nint a[10];\na[10] = 7;                   /* line 5 */\nfree(p);                     /* line 6 */</code></pre>",
      st: [
        ["Line 3 is a use-after-free through a dangling pointer.", true, "p was freed on line 2."],
        ["Line 6 is a memory leak.", false, "Freeing p again is a double free."],
        ["Line 5 may silently corrupt neighboring data without crashing.", true, "Out-of-bounds writes within the process's own memory often don't fault."],
        ["A memory leak by itself overwrites other objects' data.", false, "A leak gradually loses reusable capacity; it doesn't corrupt data."]
      ] },
    { t: "as", s: "Stack vs heap lifetimes and OS reclamation.",
      st: [
        ["Returning a pointer to a local (stack) variable gives the caller a dangling pointer.", true, "The frame is reclaimed on return and may be reused."],
        ["When a process exits, the OS reclaims all of its memory, including heap blocks it never freed.", true, "The OS manages whole address spaces."],
        ["Because the OS reclaims memory at exit, leaks never matter.", false, "In long-running servers the leaked total grows while the process is alive."],
        ["The OS tracks every individual heap block a process allocates.", false, "The OS tracks the address space; the user-level allocator tracks blocks."]
      ] },
    { t: "seg", s: "Base-and-bounds: base = 20 KB (20,480), bounds = 8 KB (8,192). All values are byte addresses.",
      st: [
        ["Virtual address 4000 translates to physical 24,480.", true, "4000 &lt; 8192, so PA = 20,480 + 4000."],
        ["Virtual address 8192 translates to physical 28,672.", false, "8192 is not less than the bound; the access faults."],
        ["Virtual address 8191 is legal and translates to 28,671.", true, "8191 &lt; 8192; 20,480 + 8191."],
        ["The bounds register holds the physical address where the process's memory ends.", false, "In this course's convention, bounds is the size of the address space (a limit, not a second base)."]
      ] },
    { t: "seg", s: "Statements about base-and-bounds relocation.",
      st: [
        ["The base and bounds registers must be privileged.", true, "Otherwise a process could point its base at another process's memory."],
        ["A context switch copies the old process's memory out and the new one's in.", false, "Processes stay in place; the OS saves and restores base/bounds in the PCB."],
        ["One base/bounds pair lets two processes share only their code region.", false, "A single pair covers the whole address space."],
        ["The unused heap–stack gap inside the allocated block is wasted physical memory, which the course calls internal fragmentation.", true, "It's reserved inside a unit assigned to the process."]
      ] },
    { t: "seg", s: "14-bit virtual addresses; the top 2 bits select the segment, the low 12 bits are the offset. Segment 0 (code): base 16 KB (16,384), size 2 KB. Segment 1 (heap): base 40 KB (40,960), size 3 KB. Both grow upward.",
      st: [
        ["0x0300 translates to 17,152.", true, "Segment 0, offset 0x300 = 768 &lt; 2048 → 16,384 + 768."],
        ["0x1A00 translates to 47,616.", false, "Segment 1, offset 0xA00 = 2560 → 40,960 + 2560 = 43,520. Adding the whole address 0x1A00 = 6656 is the classic mistake."],
        ["0x1C80 causes a segmentation fault.", true, "Segment 1, offset 0xC80 = 3200 ≥ 3072."],
        ["0x0900 translates to 18,688.", false, "Segment 0, offset 0x900 = 2304 ≥ 2048, so it faults."]
      ] },
    { t: "seg", s: "16 KB address space, 14-bit addresses, top 2 bits = segment, so each segment can span 4 KB. The stack is segment 3 (binary 11): it grows <b>downward</b>, its physical upper edge is 28 KB and it has 2 KB allocated.",
      st: [
        ["Virtual address 15 KB (0x3C00) translates to physical 27 KB.", true, "Offset 0xC00 = 3 KB; 3 − 4 = −1 KB; 28 KB − 1 KB = 27 KB."],
        ["Virtual address 15 KB translates to 28 KB + 15 KB = 43 KB.", false, "A downward-growing segment uses a negative offset from its upper edge."],
        ["Virtual address 13 KB (0x3400) fails the stack's bound check.", true, "Offset 1 KB → −3 KB; 3 KB exceeds the 2 KB allocated."],
        ["Segmentation eliminates external fragmentation.", false, "Variable-sized segments cause external fragmentation."]
      ] },
    { t: "seg", s: "Physical memory (in order): free 8 KB, used 8 KB, free 4 KB, used 8 KB, free 12 KB, used 8 KB. A new process needs a 20 KB segment.",
      st: [
        ["The request fails even though 24 KB is free; this is external fragmentation.", true, "No single hole is 20 KB."],
        ["Segments are fixed-size units like pages.", false, "Segments are variable-sized logical regions."],
        ["Compaction is cheap because only the segment registers change.", false, "It must copy live memory, pause the processes and update their bases."],
        ["Segmentation can let two processes share one physical copy of code marked read-execute.", true, "Protection bits make sharing safe."]
      ] },
    { t: "free", s: "Statements about free lists, splitting and coalescing.",
      st: [
        ["If two free blocks are next to each other in the free list, they are physically adjacent.", false, "List order is search order; check addresses."],
        ["Coalescing merges physically adjacent free blocks into one larger block.", true, "Adjacency is by address."],
        ["A split should create a remainder block only if it can hold the metadata plus usable payload.", true, "Otherwise the allocation absorbs the small remainder."],
        ["Embedded headers consume no space in the managed region.", false, "Headers and free-list nodes live inside the pool."]
      ] },
    { t: "free", s: "Free blocks in address order: 20, 50, 15, 40 bytes (none adjacent). Ignore headers and alignment. Two requests arrive: 14, then 36. Each policy starts from the same initial list.",
      st: [
        ["First fit ends with free blocks 6, 14, 15, 40.", true, "14 from the 20 (→ 6); 36 from the 50 (→ 14)."],
        ["Best fit leaves a 1-byte fragment after the first request.", true, "14 from the 15."],
        ["Worst fit serves the 36-byte request from the block that was originally 50 bytes.", false, "After the first request the 50 became 36, so the largest block is 40; worst fit picks the 40."],
        ["After both requests, best fit's largest free block is 50.", true, "Best fit leaves 20, 50, 1, 4."]
      ] },
    { t: "free", s: "OSTEP's 4 KB heap: 8-byte headers, an 8-byte free-list node, and a 4096-byte region that starts as one free chunk.",
      st: [
        ["After one <code>malloc(100)</code>, the free chunk's size is 3980.", true, "4088 − 108 = 3980."],
        ["After three <code>malloc(100)</code> calls, the free chunk's size is 3764.", true, "4088 − 3 × 108 = 3764."],
        ["<code>free()</code> needs the caller to pass the block's size.", false, "The size is read from the header at ptr − sizeof(header)."],
        ["The header sits immediately after the region returned to the caller.", false, "It sits immediately before it."]
      ] },
    { t: "free", s: "An allocator uses 8-byte alignment and an 8-byte header. A client requests 13 bytes.",
      st: [
        ["The block contains 3 bytes of internal fragmentation in its payload.", true, "13 rounds to 16."],
        ["The 8 header bytes are part of those 3 wasted bytes.", false, "Header bytes are bookkeeping overhead, counted separately."],
        ["The allocation consumes 24 bytes of the pool.", true, "16 payload + 8 header."],
        ["If a split would leave a remainder too small for a header plus payload, the remainder should be absorbed into the allocation.", true, "That's the minimum-remainder rule."]
      ] },
    { t: "free", s: "Comparing placement policies and other allocators.",
      st: [
        ["Best fit is always the best policy because it leaves the smallest leftover each time.", false, "Its tiny leftovers often become unusable; no policy wins every workload."],
        ["Next fit starts searching where the previous search ended, spreading allocations across the list.", true, "That's how it differs from first fit."],
        ["A binary buddy allocator can suffer internal fragmentation.", true, "Requests round up to a power of two."],
        ["Worst fit must scan the whole free list unless the list is kept sorted.", true, "It needs the largest block."]
      ] },
    { t: "pg", s: "A system has 32-bit virtual addresses, 4 KB pages and 4-byte PTEs, with a linear page table per process.",
      st: [
        ["The offset is 12 bits.", true, "2<sup>12</sup> = 4096."],
        ["There are 2<sup>20</sup> virtual pages.", true, "32 − 12 = 20 VPN bits."],
        ["Each process's page table is 4 MB.", true, "2<sup>20</sup> × 4 B."],
        ["With 16 KB pages instead, each linear table would be 2 MB.", false, "2<sup>18</sup> × 4 B = 1 MB."]
      ] },
    { t: "pg", s: "16 KB address space, 1 KB pages. Valid mappings: VPN 0 → PFN 5, VPN 1 → 8, VPN 4 → 2, VPN 15 → 12. All other entries have valid = 0.",
      st: [
        ["0x0420 translates to 0x2020.", true, "VPN 1, offset 0x20 → 8 × 1024 + 32."],
        ["0x1234 translates to 0x0A34.", true, "VPN 4, offset 0x234 → 2 × 1024 + 564 = 2612."],
        ["Accessing 0x2800 causes a page fault, and the OS reads the page from swap.", false, "VPN 10 has valid = 0: an illegal access (segmentation fault), not a page fault."],
        ["0x3C10 translates to 0x3010.", true, "VPN 15, offset 0x10 → 12 × 1024 + 16."]
      ] },
    { t: "pg", s: "Page-table entry bits and what they mean.",
      st: [
        ["Writing to a valid, present page marked read-execute raises a protection fault.", true, "Protection bits are checked even when the page is present."],
        ["Accessing a page with valid = 1 and present = 0 causes a page fault; the OS brings the page in from swap.", true, "Legal but not resident."],
        ["Accessing a page with valid = 0 makes the OS load it from swap.", false, "Valid = 0 is an illegal access; the process usually gets a segmentation fault."],
        ["The reference bit is set when a page is modified.", false, "That's the dirty bit. The reference bit is set on any access."]
      ] },
    { t: "pg", s: "Statements about TLBs.",
      st: [
        ["A TLB miss means the page is on disk.", false, "It means the translation isn't cached."],
        ["A TLB miss can be resolved from the in-memory page table without disk I/O.", true, "If the page is present, no disk access is needed."],
        ["After a miss, the translation is inserted into the TLB and the instruction is retried.", true, "The retry hits."],
        ["Without flushing or ASIDs, after a switch from A to B, B could use A's cached VPN 10 → PFN 100 entry.", true, "Same VPN, different process; the stale entry would map B to A's frame."]
      ] },
    { t: "pg", s: "A loop sums <code>a[0]</code>…<code>a[9]</code> (4-byte ints). Pages are 16 bytes and <code>a[0]</code> starts at offset 4 of VPN 6. The TLB starts empty and is large enough to hold every entry.",
      st: [
        ["The first pass has 3 TLB misses.", true, "a[0..2] in VPN 6, a[3..6] in VPN 7, a[7..9] in VPN 8."],
        ["The first pass has a 70% hit rate.", true, "7 hits out of 10."],
        ["Running the loop again immediately gives a 100% hit rate.", true, "Temporal locality: the three entries are still cached."],
        ["With 32-byte pages, the first pass would have the same number of misses.", false, "a[0..6] fall in one 32-byte page and a[7..9] in the next: 2 misses."]
      ] },
    { t: "pg", s: "A TLB lookup takes 1 ns and a memory access takes 100 ns. On a hit: TLB + data. On a miss with a linear table: TLB + PTE read + data.",
      st: [
        ["At a 95% hit rate, the effective access time is 106 ns.", true, "0.95 × 101 + 0.05 × 201 = 106."],
        ["At an 80% hit rate, it is 121 ns.", true, "0.8 × 101 + 0.2 × 201 = 121."],
        ["At a 50% hit rate, it is 150 ns.", false, "0.5 × 101 + 0.5 × 201 = 151."],
        ["With a two-level table, a TLB miss would cost 301 ns.", true, "1 + 100 (PDE) + 100 (PTE) + 100 (data)."]
      ] },
    { t: "pg", s: "Page size tradeoffs.",
      st: [
        ["Larger pages increase TLB reach.", true, "Each entry covers more memory."],
        ["Larger pages reduce the number of PTEs in a linear table.", true, "Fewer pages to describe."],
        ["Larger pages reduce internal fragmentation.", false, "They increase it."],
        ["A 64-entry TLB with 4 KB pages covers 256 KB.", true, "64 × 4 KB."]
      ] },
    { t: "ml", s: "16 KB address space, 64-byte pages, 4-byte PTEs, two-level table where each level fits in one page.",
      st: [
        ["One page-table page holds 16 PTEs.", true, "64 ÷ 4."],
        ["The page-directory index is 4 bits.", true, "8 VPN bits − 4 PT-index bits."],
        ["A linear table for this space would have 256 entries.", true, "16 KB ÷ 64 B."],
        ["Virtual address 0x0041 has page-table index 0.", false, "0x0041 = 0000 | 0001 | 000001, so the PT index is 1."]
      ] },
    { t: "ml", s: "Same system. PD[0] → table in frame 100; PD[15] → table in frame 101; all other PDEs invalid. Frame 100: PTE[0] → PFN 10, PTE[1] → PFN 23. Frame 101: PTE[15] → PFN 55.",
      st: [
        ["0x0005 translates to 645.", true, "PD 0, PT 0, offset 5 → 10 × 64 + 5."],
        ["0x0041 translates to 1473.", true, "PD 0, PT 1, offset 1 → 23 × 64 + 1."],
        ["0x1000 causes a page fault and a disk read.", false, "PD index 4 is invalid: a segmentation fault."],
        ["A TLB hit for 0x3FC0 still requires reading the page directory.", false, "A hit uses the cached PFN; the walk happens only on a miss."]
      ] },
    { t: "ml", s: "Multi-level page tables in general.",
      st: [
        ["Multi-level tables reduce the size of the virtual address space.", false, "The space is unchanged; unused regions just get no lower-level tables."],
        ["Lower-level tables are allocated only for regions of the address space that contain mappings.", true, "An invalid PDE means no page of PTEs."],
        ["The cost of a TLB hit doesn't depend on how many levels the table has.", true, "Depth matters only on misses."],
        ["For 32-bit addresses, 4 KB pages and 4-byte entries, the split is 10 | 10 | 12.", true, "1024 entries per page → 10 index bits per level."]
      ] },
    { t: "swap", s: "Page faults and demand paging.",
      st: [
        ["Every page fault requires evicting a page.", false, "Only when no free frame is available."],
        ["The faulting process blocks during the disk read, and the scheduler can run another ready process.", true, "Disk I/O takes milliseconds."],
        ["After the read completes, the OS sets the PTE's present bit and PFN, then the faulting instruction is restarted.", true, "The retry then finds the page present."],
        ["The hardware services a page fault entirely without the OS.", false, "The hardware traps; the OS handler does the work."]
      ] },
    { t: "swap", s: "Dirty pages, watermarks and thrashing.",
      st: [
        ["A clean page can be dropped without writing it to disk.", true, "Its copy on disk is still current."],
        ["When free frames drop below the low watermark, a background daemon evicts pages until the high watermark is reached.", true, "Then it sleeps."],
        ["A better replacement policy fixes thrashing when the active working sets exceed RAM.", false, "No policy creates capacity; run fewer processes."],
        ["During thrashing, CPU utilization collapses while disk queues saturate.", true, "Processes spend their time blocked on page faults."]
      ] },
    { t: "swap", s: "Three frames, initially empty. Reference string: 7, 0, 1, 2, 0, 3, 0, 4, 2, 3.",
      st: [
        ["FIFO incurs 9 page faults.", true, "Only the second reference to 0 hits."],
        ["LRU incurs 8 page faults.", true, "Hits on both 0s after 2 and 3."],
        ["The optimal policy incurs 6 page faults.", true, "Faults on 7, 0, 1, 2, 3, 4; hits on 0, 0, 2, 3."],
        ["At the reference to 3 (sixth reference), LRU evicts page 0.", false, "0 was used at reference 5; the least recently used page is 1."]
      ] },
    { t: "swap", s: "Clock with three frames. A page's use bit is set to 1 when it is loaded or hit. Frames fill in order while free. The hand starts at frame 0 and moves only while searching for a victim, then steps past the replaced frame. Reference string: 1, 2, 3, 4, 1, 5.",
      st: [
        ["The reference to 4 evicts page 1.", true, "All bits are 1; the hand clears frames 0, 1, 2 and comes back to frame 0, now 0."],
        ["Before choosing a victim for 4, the hand clears all three use bits.", true, "Second chance for each."],
        ["The second reference to 1 is a hit.", false, "1 was just evicted; it faults and evicts page 2."],
        ["The reference to 5 evicts page 3.", true, "The hand is at frame 2 (page 3, bit 0)."]
      ] },
    { t: "swap", s: "Comparing replacement policies.",
      st: [
        ["The optimal policy evicts the page used farthest in the future and can't be implemented in a real OS.", true, "It needs future knowledge; it's a comparison baseline."],
        ["FIFO moves a page to the back of the queue when it is hit.", false, "FIFO ignores hits."],
        ["Exact LRU is expensive because it needs bookkeeping on every memory reference.", true, "Hence approximations like clock."],
        ["With FIFO, adding frames can increase the number of faults.", true, "Belady's anomaly."]
      ] },
    { t: "p2", s: "In P2 cachelab, placement policy (first/best fit) and eviction policy (FIFO/clock) operate over shared state.",
      st: [
        ["Placement chooses a free block; eviction chooses an occupied object.", true, "Two independent dimensions."],
        ["Under FIFO, a GET hit moves the entry to the tail of the policy list.", false, "GET doesn't refresh FIFO order; it only sets the reference bit."],
        ["A GET miss allocates space for the key so a later PUT is faster.", false, "A GET miss only increments the miss counter."],
        ["Evicting an object changes the free-space layout, which can change the next placement decision.", true, "The freed block (possibly coalesced) becomes a candidate."]
      ] },
    { t: "p2", s: "P2 trace: 256-byte pool, HEADER_SIZE = 24, 8-byte alignment, first fit, FIFO. Requests: PUT a 40, PUT b 100, PUT c 50.",
      st: [
        ["After PUT b, the only free block has payload capacity 40.", true, "232 → a takes 40 (rest 168) → b takes 104 (rest 168 − 104 − 24 = 40)."],
        ["PUT c evicts exactly one object.", false, "Evicting a leaves two 40-byte free blocks; c needs 56. b must also go, and then everything coalesces."],
        ["After evicting only a, 80 bytes are free in total, but no block can hold c.", true, "Two separate 40-byte blocks."],
        ["After PUT c completes, occupancy is 50.", true, "Occupancy counts requested size, not the 56-byte capacity."]
      ] },
    { t: "p2", s: "P2 bookkeeping rules.",
      st: [
        ["<code>block_header_t.size</code> is payload capacity and excludes the header.", true, "Not total bytes and not the requested size."],
        ["Occupancy increases by the block's capacity after a successful PUT.", false, "It increases by the requested size."],
        ["A PUT larger than <code>pool.size − HEADER_SIZE</code> is rejected before any existing entry with the same key is removed.", true, "Otherwise a rejected PUT would destroy the old value."],
        ["A PUT for an existing key counts as an eviction.", false, "It's an UPDATE; the eviction counter doesn't change."]
      ] },
    { t: "p2", s: "Clock eviction in P2.",
      st: [
        ["A successful GET sets the entry's reference bit.", true, "So does a PUT."],
        ["The clock hand is reset to the policy-list head at the start of every victim search.", false, "The hand persists between searches."],
        ["The selector should not unlink the victim; the provided eviction helper does that.", true, "Unlinking twice corrupts the list."],
        ["If every entry's bit is set, the hand clears all of them and then selects the entry it started at.", true, "It behaves like FIFO for that sweep."]
      ] },
    { t: "p2", s: "P2 pool in address order: X (free, 32), Y (allocated, 64), Z (free, 48). HEADER_SIZE = 24. Y is freed.",
      st: [
        ["After <code>pool_free(Y)</code>, one free block of capacity 192 remains.", true, "32 + 24 + 64 + 24 + 48 = 192."],
        ["Merging only Y's successor would leave two adjacent free blocks, breaking a pool invariant.", true, "X and the merged Y+Z would touch."],
        ["Coalescing should merge Y with whichever block follows it in free-list order, even if that block isn't adjacent.", false, "Merge only physically adjacent free blocks."],
        ["Coalescing loses the bytes of the headers that disappear.", false, "It recovers them: each merge adds HEADER_SIZE."]
      ] },
    { t: "mlfq", s: "Statements about MLFQ priority changes.",
      st: [
        ["A priority boost moves only the job that has waited longest back to the top queue.", false, "The boost moves every job to the top."],
        ["Once a job is demoted, it can never return to a higher queue.", false, "The periodic boost returns it to the top."],
        ["Making the boost period S very long eliminates starvation.", false, "A long S lets low-priority jobs starve longer; S bounds the wait."],
        ["MLFQ requires each job to declare its expected run time when it starts.", false, "MLFQ learns from observed behavior because lengths are unknown."]
      ] },
    { t: "share", s: "Two jobs with equal tickets each need 10 ms of CPU. Under lottery scheduling, the first finishes at t = 10 and the second at t = 20. Unfairness U = first finish time ÷ second finish time.",
      st: [
        ["U = 2 for this run.", false, "10 ÷ 20 = 0.5."],
        ["U = 0.5 for this run.", true, "10 ÷ 20."],
        ["Lottery guarantees U = 1 for jobs of any length.", false, "Short jobs can be very unfair; U approaches 1 only as jobs get longer."],
        ["Longer jobs tend to push U farther from 1.", false, "Longer jobs push average U toward 1."]
      ] },
    { t: "as", s: "Statements about the C memory API.",
      st: [
        ["<code>calloc</code> may return memory that still holds old data.", false, "calloc zeroes the memory before returning it."],
        ["If <code>int *x = malloc(40)</code>, then <code>sizeof(x)</code> is 40.", false, "sizeof gives the pointer's size (e.g. 8), not the allocation."],
        ["<code>realloc</code> may return a different pointer from the one passed in.", true, "It may move the block to fit the new size."],
        ["Programs should call <code>brk</code>/<code>sbrk</code> directly instead of using malloc.", false, "malloc uses them internally; programmers shouldn't call them directly."]
      ] },
    { t: "seg", s: "Statements about relocation and segmentation.",
      st: [
        ["Compaction permanently prevents external fragmentation.", false, "Later allocations and frees create new holes; compaction is a temporary repair."],
        ["Under base and bounds, physical address = bounds + virtual address.", false, "PA = base + VA, after checking VA &lt; bounds."],
        ["A virtual address equal to the bounds value is the last legal byte.", false, "Legal addresses are strictly less than the bounds."],
        ["Segmentation requires the stack segment to sit directly after the heap in physical memory.", false, "Each segment can be placed anywhere in physical memory."]
      ] },
    { t: "free", s: "A 30-byte heap has bytes 10–19 in use. The free list is head → (addr 0, len 10) → (addr 20, len 10). Ignore headers.",
      st: [
        ["A 15-byte request can be satisfied.", false, "No single free region has 15 contiguous bytes."],
        ["Allocating 1 byte from the region at address 20 leaves head → (0, 10) → (21, 9).", true, "Split: the remainder starts at 21 with length 9."],
        ["If bytes 10–19 are freed without coalescing, a 20-byte request succeeds.", false, "Three separate 10-byte entries; none holds 20 until they are merged."],
        ["The (0, 10) and (20, 10) entries may be merged because they are consecutive in the list.", false, "They aren't physically adjacent: bytes 10–19 lie between them."]
      ] },
    { t: "pg", s: "Statements about pages, frames and page tables.",
      st: [
        ["Paging eliminates all fragmentation.", false, "Internal fragmentation remains in partially used pages."],
        ["Virtual pages and physical frames are generally different sizes.", false, "They are the same size; only the number changes."],
        ["One page table is shared by every process in the system.", false, "Page tables are per process."],
        ["Two processes can map different VPNs to the same physical frame.", true, "That's how shared pages work (e.g. VPN 10 in one, VPN 50 in another, both → PFN 101)."]
      ] },
    { t: "ml", s: "Statements about page-table structures.",
      st: [
        ["A multi-level table makes TLB misses cheaper than a linear table.", false, "Misses get more expensive: one more memory access per level."],
        ["Each valid page-directory entry points to a page of user data.", false, "A PDE points to a page of PTEs."],
        ["An inverted page table keeps one entry per physical frame.", true, "Each entry records which process and VPN occupy that frame."],
        ["A two-level table always uses more memory than a linear table for the same address space.", false, "For sparse spaces it uses far less (about 12 KB vs 4 MB in the slides)."]
      ] },
    { t: "swap", s: "Statements about swapping and demand paging.",
      st: [
        ["Swap space is a reserved region of RAM.", false, "It's on disk or SSD."],
        ["Demand paging loads all of a process's pages when it starts.", false, "Pages load only when first accessed."],
        ["A page can be valid but not present.", true, "Legal part of the address space, currently on disk."],
        ["Thrashing is caused by having too few TLB entries.", false, "Thrashing happens when working sets exceed physical memory."]
      ] },
    { t: "p2", s: "Statements about P2 cachelab.",
      st: [
        ["<code>handle_put</code> must lock <code>cache_lock</code> itself to be correct.", false, "The provided worker already holds the locks for the whole request."],
        ["The policy list orders entries by address in the pool.", false, "It's insertion order; the pool block list is address order."],
        ["If total free bytes ≥ the request, <code>pool_try_alloc</code> is guaranteed to succeed.", false, "It needs one contiguous block large enough."],
        ["After <code>pool_free()</code> returns, no two adjacent blocks are both free.", true, "That's the coalescing invariant."]
      ] }
  ];

  // Code assembly: blocks with id; ok = accepted orders
  var CA = [
    { title: "split_if_possible", s: "Assemble the body of <code>static void split_if_possible(block_header_t *block, size_t requested)</code>. The remainder must start at an aligned position after the payload, and a split happens only when the remainder can hold a header plus at least one payload byte.",
      blocks: [
        { id: "a1", code: "size_t physical = round_up(requested, HEADER_ALIGNMENT);" },
        { id: "a2", code: "size_t physical = requested;", why: "Unrounded size: the next header could be misaligned." },
        { id: "a3", code: "if (physical > block->size || block->size - physical < MIN_BLOCK_SIZE)\n    return;" },
        { id: "a4", code: "if (block->size - physical - HEADER_SIZE < MIN_BLOCK_SIZE)\n    return;", why: "MIN_BLOCK_SIZE already includes the header, so this counts it twice (and doesn't guard physical > size)." },
        { id: "a5", code: "block_header_t *rest = (block_header_t *)\n    ((unsigned char *)payload_from_header(block) + physical);" },
        { id: "a6", code: "block_header_t *rest = (block_header_t *)\n    ((unsigned char *)block + physical);", why: "Computes the split point from the header instead of the payload: rest overlaps the allocation." },
        { id: "a7", code: "rest->size = block->size - physical - HEADER_SIZE;\nrest->free = 1;\nrest->next = block->next;" },
        { id: "a8", code: "rest->size = block->size - physical;\nrest->free = 1;\nrest->next = block->next;", why: "Forgets the new header's bytes, so blocks overrun the pool." },
        { id: "a9", code: "block->size = physical;\nblock->next = rest;" },
        { id: "a10", code: "block->next = rest;\nblock->size = requested;", why: "Records the unrounded size; the block's capacity no longer reaches rest's header." }
      ],
      ok: [["a1", "a3", "a5", "a7", "a9"]],
      note: "rest->size must be computed before block->size changes, and rest->next = block->next must run before block->next = rest." },
    { title: "pool_free", s: "Assemble <code>void pool_free(memory_pool_t *pool, void *payload, event_context_t *ev)</code> after the NULL check. Afterwards no two adjacent free blocks may remain. (COALESCE output omitted.)",
      blocks: [
        { id: "b1", code: "block_header_t *block = header_from_payload(payload);\nblock->free = 1;" },
        { id: "b2", code: "if (block->next && block->next->free) {\n    block_header_t *succ = block->next;\n    block->size += HEADER_SIZE + succ->size;\n    block->next = succ->next;\n}" },
        { id: "b3", code: "if (block->next && block->next->free) {\n    block_header_t *succ = block->next;\n    block->size += succ->size;\n    block->next = succ->next;\n}", why: "Doesn't recover the successor's header bytes." },
        { id: "b4", code: "block_header_t *prev = NULL, *cur = pool->blocks;\nwhile (cur && cur != block) { prev = cur; cur = cur->next; }" },
        { id: "b5", code: "block_header_t *prev = pool->blocks;\nwhile (prev->next != block) prev = prev->next;", why: "If block is the first block, this walks off the end of the list." },
        { id: "b6", code: "if (prev && prev->free) {\n    prev->size += HEADER_SIZE + block->size;\n    prev->next = block->next;\n}" },
        { id: "b7", code: "if (prev && prev->free) {\n    prev->size += HEADER_SIZE + block->size;\n    prev->next = block;\n}", why: "prev still links to the absorbed block, leaving a stale header in the list." },
        { id: "b8", code: "return;   /* one merge is enough */", why: "Stops after one side; both neighbors may be free." }
      ],
      ok: [["b1", "b2", "b4", "b6"], ["b1", "b4", "b2", "b6"]],
      note: "Merge the successor before absorbing block into its predecessor; otherwise the successor merge updates a header that no longer exists. Finding prev can happen before or after the successor merge." },
    { title: "handle_put", s: "Assemble the body of <code>handle_put</code> after the PUT event is printed. Event output other than comments is omitted.",
      blocks: [
        { id: "c1", code: "if (req->size > cache->pool.size - HEADER_SIZE) {\n    cache->rejects++;          /* REJECT */\n    return;\n}" },
        { id: "c2", code: "cache_entry_t *old = index_find(cache, req->key);\nif (old) {                     /* UPDATE */\n    index_remove(cache, old);\n    policy_remove(cache, old);\n    cache->occupancy -= old->requested_size;\n    pool_free(&cache->pool, old->payload, ev);\n}" },
        { id: "c3", code: "cache_entry_t *old = index_find(cache, req->key);\nif (old)\n    evict_one(cache, old, ev);", why: "An UPDATE isn't a policy eviction; this bumps the eviction counter and prints EVICT." },
        { id: "c4", code: "void *payload = pool_try_alloc(&cache->pool, req->size);" },
        { id: "c5", code: "while (!payload) {\n    cache_entry_t *victim = cache->eviction_policy == EVICT_CLOCK\n        ? evict_clock_select(cache) : evict_fifo_select(cache);\n    evict_one(cache, victim, ev);\n    payload = pool_try_alloc(&cache->pool, req->size);\n}" },
        { id: "c6", code: "if (!payload) {\n    cache_entry_t *victim = cache->eviction_policy == EVICT_CLOCK\n        ? evict_clock_select(cache) : evict_fifo_select(cache);\n    evict_one(cache, victim, ev);\n    payload = pool_try_alloc(&cache->pool, req->size);\n}", why: "One eviction may not free a large enough contiguous block." },
        { id: "c7", code: "cache_entry_t *entry = &req->entry_storage;\nstrcpy(entry->key, req->key);\nentry->requested_size = req->size;\nentry->payload = payload;\nentry->reference_bit = 1;" },
        { id: "c8", code: "cache_entry_t *entry = &req->entry_storage;\nstrcpy(entry->key, req->key);\nentry->requested_size = req->size;\nentry->payload = payload;\nentry->reference_bit = 0;", why: "A new insertion must start with its reference bit set." },
        { id: "c9", code: "index_insert(cache, entry);\npolicy_append(cache, entry);\ncache->occupancy += req->size;   /* ALLOC */" },
        { id: "c10", code: "index_insert(cache, entry);\npolicy_append(cache, entry);\ncache->occupancy += pool_payload_capacity(payload);", why: "Occupancy counts requested size, not block capacity." }
      ],
      ok: [["c1", "c2", "c4", "c5", "c7", "c9"]],
      note: "Reject before touching an existing key, then UPDATE, then allocate with an eviction retry loop, then insert." },
    { title: "evict_clock_select", s: "Assemble <code>cache_entry_t *evict_clock_select(cache_t *cache)</code>. It must only select the victim; <code>evict_one</code> unlinks it.",
      blocks: [
        { id: "d1", code: "if (!cache->policy_head)\n    return NULL;" },
        { id: "d2", code: "cache->clock_hand = cache->policy_head;", why: "Resets the hand on every search; the hand must persist." },
        { id: "d3", code: "for (;;) {" },
        { id: "d4", code: "    cache_entry_t *candidate = cache->clock_hand;" },
        { id: "d5", code: "    cache_entry_t *candidate = cache->policy_head;", why: "Always starts from the head, ignoring the hand." },
        { id: "d6", code: "    cache->clock_hand = policy_successor(cache, candidate);" },
        { id: "d7", code: "    if (candidate->reference_bit)\n        candidate->reference_bit = 0;\n    else\n        return candidate;" },
        { id: "d8", code: "    if (candidate->reference_bit) {\n        candidate->reference_bit = 0;\n    } else {\n        policy_remove(cache, candidate);\n        return candidate;\n    }", why: "Unlinks the victim here, then evict_one removes it again." },
        { id: "d9", code: "}" }
      ],
      ok: [["d1", "d3", "d4", "d6", "d7", "d9"]],
      note: "Advance the hand past the candidate before deciding, so a selected victim leaves the hand on its successor." },
    { title: "handle_get", s: "Assemble <code>void handle_get(cache_t *cache, request_t *req, event_context_t *ev)</code>. (HIT/MISS output shown as comments.)",
      blocks: [
        { id: "e1", code: "cache_entry_t *entry = index_find(cache, req->key);" },
        { id: "e2", code: "pthread_mutex_lock(&cache->cache_lock);", why: "The worker already holds the locks for the whole request." },
        { id: "e3", code: "if (entry) {\n    entry->reference_bit = 1;\n    cache->hits++;              /* HIT */\n}" },
        { id: "e4", code: "if (entry) {\n    policy_remove(cache, entry);\n    policy_append(cache, entry);\n    entry->reference_bit = 1;\n    cache->hits++;\n}", why: "Reorders the policy list on a hit, turning FIFO into LRU." },
        { id: "e5", code: "else {\n    cache->misses++;            /* MISS */\n}" },
        { id: "e6", code: "else {\n    cache->misses++;\n    cache->clock_hand = policy_successor(cache, cache->clock_hand);\n}", why: "A GET miss must not move the clock hand." }
      ],
      ok: [["e1", "e3", "e5"]],
      note: "A GET touches only the reference bit and the hit/miss counters." },
    { title: "pool_try_alloc", s: "Assemble <code>void *pool_try_alloc(memory_pool_t *pool, size_t requested)</code>.",
      blocks: [
        { id: "f1", code: "block_header_t *block = pool->policy == ALLOC_BEST_FIT\n    ? best_fit(pool, requested) : first_fit(pool, requested);" },
        { id: "f2", code: "if (!block)\n    return NULL;" },
        { id: "f3", code: "split_if_possible(block, requested);" },
        { id: "f4", code: "split_if_possible(block, block->size);", why: "Splitting at the full capacity never leaves a remainder." },
        { id: "f5", code: "block->free = 0;" },
        { id: "f6", code: "return payload_from_header(block);" },
        { id: "f7", code: "return (void *)block;", why: "Returns the header address; the caller would overwrite the header." }
      ],
      ok: [["f1", "f2", "f3", "f5", "f6"], ["f1", "f2", "f5", "f3", "f6"]],
      note: "Splitting and marking the block allocated can happen in either order; split_if_possible doesn't read block->free." },
    { title: "best_fit", s: "Assemble <code>static block_header_t *best_fit(memory_pool_t *pool, size_t requested)</code>: return the smallest free block whose capacity fits, or NULL.",
      blocks: [
        { id: "g1", code: "block_header_t *best = NULL;" },
        { id: "g2", code: "for (block_header_t *cur = pool->blocks; cur; cur = cur->next) {" },
        { id: "g3", code: "    if (cur->free && cur->size >= requested &&\n        (best == NULL || cur->size < best->size))\n        best = cur;" },
        { id: "g4", code: "    if (cur->size >= requested &&\n        (best == NULL || cur->size < best->size))\n        best = cur;", why: "Missing the free check: could pick an allocated block." },
        { id: "g5", code: "    if (cur->free && cur->size >= requested &&\n        (best == NULL || cur->size > best->size))\n        best = cur;", why: "Picks the largest block: worst fit." },
        { id: "g6", code: "    if (cur->free && cur->size >= requested)\n        return cur;", why: "Returns the first fit." },
        { id: "g7", code: "}" },
        { id: "g8", code: "return best;" }
      ],
      ok: [["g1", "g2", "g3", "g7", "g8"]],
      note: "Strict < keeps the earliest block among equal sizes." }
  ];

  // ---------- helpers ----------
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var L = "ABCD";
  function maskText(m, k) {
    var sel = []; for (var i = 0; i < k; i++) if (m & (1 << i)) sel.push(L[i]);
    if (!sel.length) return "None of the statements is true";
    if (sel.length === 1) return sel[0] + " only";
    if (sel.length === 2) return sel[0] + " and " + sel[1];
    return sel.slice(0, -1).join(", ") + ", and " + sel[sel.length - 1];
  }
  function popcount(x) { var c = 0; while (x) { c += x & 1; x >>= 1; } return c; }

  // ---------- state ----------
  var state = null, timerId = null, started = false;
  var body = document.getElementById("exBody"), result = document.getElementById("exResult");
  var topicSel = document.getElementById("exTopic");
  Object.keys(T).forEach(function (k) { var o = document.createElement("option"); o.value = k; o.textContent = T[k]; topicSel.appendChild(o); });

  function build() {
    var mode = document.getElementById("exMode").value, topic = topicSel.value;
    var mcqs = MCQ.filter(function (q) { return topic === "all" || q.t === topic; });
    var cas = (topic === "all" || topic === "p2") ? CA.slice() : [];
    if (mode === "sim") {
      // spread across topics: one per topic first, then random fill
      var byT = {}; shuffle(mcqs.slice()).forEach(function (q) { (byT[q.t] = byT[q.t] || []).push(q); });
      var pick = [], keys = shuffle(Object.keys(byT));
      while (pick.length < 16 && keys.some(function (k) { return byT[k].length; })) {
        keys.forEach(function (k) { if (pick.length < 16 && byT[k].length) pick.push(byT[k].shift()); });
      }
      mcqs = pick; cas = shuffle(cas).slice(0, 2);
    } else if (mode === "mcq") { cas = []; }
    else if (mode === "ca") { mcqs = []; }
    mcqs = shuffle(mcqs.slice()); cas = shuffle(cas);

    // balanced answer positions
    var nChoices = 5, pos = [];
    for (var i = 0; i < mcqs.length; i++) pos.push(i % nChoices);
    shuffle(pos);

    var items = mcqs.map(function (q, qi) {
      var order = shuffle(q.st.map(function (_, i) { return i; }));
      var st = order.map(function (i) { return q.st[i]; });
      var k = st.length, correct = 0;
      st.forEach(function (s, i) { if (s[1]) correct |= (1 << i); });
      var all = []; for (var m = 0; m < (1 << k); m++) if (m !== correct) all.push(m);
      var near = shuffle(all.filter(function (m) { return popcount(m ^ correct) === 1; }));
      var far = shuffle(all.filter(function (m) { return popcount(m ^ correct) !== 1; }));
      var d = near.slice(0, 3).concat(far).slice(0, nChoices - 1);
      d = shuffle(d);
      d.splice(pos[qi], 0, correct);
      return { kind: "mcq", q: q, st: st, k: k, correct: correct, choices: d, pick: null };
    });
    cas.forEach(function (c) {
      items.push({ kind: "ca", c: c, blocks: shuffle(c.blocks.slice()), seq: [] });
    });
    state = { items: items, graded: false };
    render();
    result.innerHTML = "";
    startTimer();
  }

  function render() {
    var h = "", n = 0;
    state.items.forEach(function (it, idx) {
      n++;
      if (it.kind === "mcq") {
        h += '<div class="q" id="q' + idx + '"><div class="qh"><span class="qn">Question ' + n + '</span><span class="pill">' + esc(T[it.q.t]) + '</span></div>';
        h += '<div class="setup">' + it.q.s + "</div>";
        h += '<ol class="st">' + it.st.map(function (s, i) {
          var cls = state.graded ? (s[1] ? "T" : "F") : "";
          var why = state.graded ? '<span class="why"><b>' + (s[1] ? "True" : "False") + ".</b> " + s[2] + "</span>" : "";
          return '<li class="' + cls + '"><span class="L">' + L[i] + '.</span><span>' + s[0] + "</span>" + why + "</li>";
        }).join("") + "</ol>";
        h += '<div class="choices" role="radiogroup" aria-label="Answer for question ' + n + '">' + it.choices.map(function (m, ci) {
          var cls = "";
          if (state.graded) { if (m === it.correct) cls = "right"; else if (it.pick === ci) cls = "wrong"; }
          return '<label class="' + cls + '"><input type="radio" name="r' + idx + '" id="r' + idx + "_" + ci + '" data-i="' + idx + '" data-c="' + ci + '"' + (it.pick === ci ? " checked" : "") + (state.graded ? " disabled" : "") + '><span class="cl">' + (ci + 1) + ".</span><span>" + maskText(m, it.k) + "</span></label>";
        }).join("") + "</div>";
        if (state.graded) {
          var ok = it.choices[it.pick] === it.correct;
          h += '<p style="margin:10px 0 0"><span class="verdict ' + (ok ? "ok" : "no") + '">' + (ok ? "Correct" : (it.pick == null ? "Unanswered" : "Incorrect")) + "</span> Answer: choice " + (it.choices.indexOf(it.correct) + 1) + " (" + maskText(it.correct, it.k) + ")</p>";
        }
        h += "</div>";
      } else {
        var c = it.c, lab = {};
        it.blocks.forEach(function (b, i) { lab[b.id] = "B" + (i + 1); });
        h += '<div class="q" id="q' + idx + '"><div class="qh"><span class="qn">Question ' + n + " · Code assembly: " + esc(c.title) + '</span><span class="pill">P2 cachelab</span></div>';
        h += '<div class="setup">' + c.s + " Click blocks in order to build your answer; some blocks are unused.</div>";
        h += '<div class="blocks">' + it.blocks.map(function (b) {
          var used = it.seq.indexOf(b.id) >= 0;
          return '<button type="button" class="blk" data-i="' + idx + '" data-b="' + b.id + '"' + (used || state.graded ? " disabled" : "") + '><span class="bl">' + lab[b.id] + "</span><pre>" + esc(b.code) + "</pre></button>";
        }).join("") + "</div>";
        h += '<div class="mono" style="font-size:.78rem;color:var(--muted);margin-top:6px">Your order</div><div class="seq">' +
          (it.seq.length ? it.seq.map(function (id) { return '<span class="chip">' + lab[id] + "</span>"; }).join("") : '<span class="empty">No blocks chosen yet</span>') + "</div>";
        if (!state.graded) h += '<div class="row" style="margin-top:8px"><button type="button" class="btn ghost" data-undo="' + idx + '">Undo last</button><button type="button" class="btn ghost" data-clear="' + idx + '">Clear</button></div>';
        else {
          var g = gradeCA(it);
          h += '<p style="margin:10px 0 4px"><span class="verdict ' + (g.score === 1 ? "ok" : g.score > 0 ? "part" : "no") + '">' + Math.round(g.score * 100) + "%</span> Correct order: <span class=\"mono\">" + g.best.map(function (id) { return lab[id]; }).join(" → ") + "</span>" + (c.ok.length > 1 ? " (other accepted: " + c.ok.filter(function (o) { return o !== g.best; }).map(function (o) { return o.map(function (id) { return lab[id]; }).join(" → "); }).join("; ") + ")" : "") + "</p>";
          h += "<p style=\"margin:4px 0\">" + c.note + "</p><ul>" + c.blocks.filter(function (b) { return b.why; }).map(function (b) { return "<li><span class=\"mono\">" + lab[b.id] + "</span> is a trap: " + esc(b.why) + "</li>"; }).join("") + "</ul>";
        }
        h += "</div>";
      }
    });
    body.innerHTML = h || '<p>No questions match that filter.</p>';
  }

  function lcs(a, b) {
    var dp = []; for (var i = 0; i <= a.length; i++) { dp.push([]); for (var j = 0; j <= b.length; j++) dp[i].push(0); }
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    return dp[a.length][b.length];
  }
  function gradeCA(it) {
    var best = it.c.ok[0], bs = -1;
    it.c.ok.forEach(function (o) {
      var s = lcs(o, it.seq) / Math.max(o.length, it.seq.length || 1);
      if (s > bs) { bs = s; best = o; }
    });
    return { score: bs < 0 ? 0 : bs, best: best };
  }

  body.addEventListener("change", function (e) {
    var r = e.target;
    if (r.type === "radio" && state && !state.graded) state.items[+r.getAttribute("data-i")].pick = +r.getAttribute("data-c");
  });
  body.addEventListener("click", function (e) {
    if (!state || state.graded) return;
    var b = e.target.closest(".blk"), u = e.target.closest("[data-undo]"), c = e.target.closest("[data-clear]");
    var y = window.scrollY;
    if (b && !b.disabled) { state.items[+b.getAttribute("data-i")].seq.push(b.getAttribute("data-b")); render(); window.scrollTo(0, y); }
    else if (u) { state.items[+u.getAttribute("data-undo")].seq.pop(); render(); window.scrollTo(0, y); }
    else if (c) { state.items[+c.getAttribute("data-clear")].seq = []; render(); window.scrollTo(0, y); }
  });

  function grade() {
    if (!state || state.graded) return;
    state.graded = true; stopTimer();
    var tot = 0, got = 0, per = {};
    state.items.forEach(function (it) {
      var t = it.kind === "mcq" ? it.q.t : "p2", s;
      if (it.kind === "mcq") s = it.choices[it.pick] === it.correct ? 1 : 0;
      else s = gradeCA(it).score;
      tot++; got += s;
      per[t] = per[t] || [0, 0]; per[t][0] += s; per[t][1]++;
    });
    render();
    var h = '<div class="result"><div class="score">' + (Math.round(got * 10) / 10) + " / " + tot + " (" + Math.round(100 * got / Math.max(tot, 1)) + "%)</div><p style=\"margin:4px 0 0\">Statement truths and explanations are shown under each question. Weakest topics are listed first.</p><div class=\"topicbars\">";
    Object.keys(per).sort(function (a, b) { return per[a][0] / per[a][1] - per[b][0] / per[b][1]; }).forEach(function (k) {
      var p = per[k][0] / per[k][1];
      h += "<span>" + esc(T[k]) + "</span><span class=\"mono\">" + (Math.round(per[k][0] * 10) / 10) + " / " + per[k][1] + "</span><span class=\"bar\"><i style=\"width:" + Math.round(p * 100) + "%\"></i></span>";
    });
    h += "</div></div>";
    result.innerHTML = h;
    result.scrollIntoView({ block: "start" });
  }

  function startTimer() {
    stopTimer();
    var clock = document.getElementById("exClock");
    if (!document.getElementById("exTimer").checked) { clock.hidden = true; return; }
    var end = Date.now() + 45 * 60 * 1000; clock.hidden = false;
    var tick = function () {
      var s = Math.max(0, Math.round((end - Date.now()) / 1000));
      clock.textContent = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
      if (s === 0) grade();
    };
    tick(); timerId = setInterval(tick, 1000);
  }
  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }

  document.getElementById("exStart").addEventListener("click", function () { started = true; build(); });
  document.getElementById("exSubmit").addEventListener("click", grade);
  document.getElementById("exTimer").addEventListener("change", function () { if (state && !state.graded) startTimer(); });
  window.examEnsure = function () { if (!started) { started = true; build(); } };
  window.examData = { MCQ: MCQ, CA: CA };
  if (!document.getElementById("p-exam").hidden) window.examEnsure();
})();
