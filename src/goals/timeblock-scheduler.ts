import { Timeblock, TimeblockType } from './goal.interface.js';

export interface ScheduleConflict {
  conflictingWith: Timeblock;
  overlapMinutes: number;
}

export class TimeblockScheduler {
  private blocks: Map<string, Timeblock> = new Map();

  constructor() {
    this.seedDefaultBlocks();
  }

  public listBlocks(date?: string): Timeblock[] {
    const list = Array.from(this.blocks.values());
    if (date) {
      return list.filter((b) => b.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return list.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  }

  public addBlock(
    title: string,
    type: TimeblockType,
    date: string,
    startTime: string,
    endTime: string,
    taskId?: string,
    goalId?: string
  ): { block: Timeblock; conflicts: ScheduleConflict[] } {
    // Validate time format (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
      throw new Error(`Invalid time format for timeblock. Expected HH:MM, got "${startTime}" - "${endTime}"`);
    }

    if (startTime >= endTime) {
      throw new Error(`Start time (${startTime}) must be strictly before end time (${endTime})`);
    }

    const id = `tb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const block: Timeblock = {
      id,
      title,
      type,
      date,
      startTime,
      endTime,
      taskId,
      goalId,
      completed: false,
    };

    const conflicts = this.detectConflicts(block);
    this.blocks.set(id, block);

    return { block, conflicts };
  }

  public markCompleted(id: string, completed: boolean = true): Timeblock {
    const block = this.blocks.get(id);
    if (!block) {
      throw new Error(`Timeblock "${id}" not found`);
    }
    block.completed = completed;
    return block;
  }

  public removeBlock(id: string): boolean {
    return this.blocks.delete(id);
  }

  /**
   * Identifies conflicts (overlapping time ranges) on the same date.
   */
  public detectConflicts(candidate: Timeblock): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];
    const sameDayBlocks = this.listBlocks(candidate.date).filter((b) => b.id !== candidate.id);

    const candStartMin = this.timeToMinutes(candidate.startTime);
    const candEndMin = this.timeToMinutes(candidate.endTime);

    for (const b of sameDayBlocks) {
      const bStartMin = this.timeToMinutes(b.startTime);
      const bEndMin = this.timeToMinutes(b.endTime);

      const overlapStart = Math.max(candStartMin, bStartMin);
      const overlapEnd = Math.min(candEndMin, bEndMin);

      if (overlapStart < overlapEnd) {
        conflicts.push({
          conflictingWith: b,
          overlapMinutes: overlapEnd - overlapStart,
        });
      }
    }

    return conflicts;
  }

  /**
   * Recommends optimal deep focus slots aligning with peak morning/afternoon cognitive energy.
   */
  public suggestFocusSlot(date: string, durationMinutes: number = 90): { recommendedStart: string; recommendedEnd: string; reason: string } {
    const defaultPeakWindows = [
      { start: '09:00', end: '11:00', label: 'Morning Deep Cognitive Peak' },
      { start: '14:00', end: '16:00', label: 'Afternoon Architecture & Study Focus' },
      { start: '19:30', end: '21:00', label: 'Evening Review & Synthesis Block' },
    ];

    const dayBlocks = this.listBlocks(date);

    for (const window of defaultPeakWindows) {
      const winStartMin = this.timeToMinutes(window.start);
      const winEndMin = this.timeToMinutes(window.end);

      // Check if window is free
      const hasConflict = dayBlocks.some((b) => {
        const bStart = this.timeToMinutes(b.startTime);
        const bEnd = this.timeToMinutes(b.endTime);
        return Math.max(winStartMin, bStart) < Math.min(winEndMin, bEnd);
      });

      if (!hasConflict) {
        const endMinutes = winStartMin + durationMinutes;
        return {
          recommendedStart: window.start,
          recommendedEnd: this.minutesToTime(endMinutes),
          reason: `${window.label} — clear of existing calendar commitments.`,
        };
      }
    }

    // Default fallback to 16:30
    return {
      recommendedStart: '16:30',
      recommendedEnd: this.minutesToTime(this.timeToMinutes('16:30') + durationMinutes),
      reason: 'Late Afternoon Focus Window',
    };
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private minutesToTime(totalMin: number): string {
    const h = Math.floor(totalMin / 60) % 24;
    const m = totalMin % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  private seedDefaultBlocks(): void {
    const today = new Date().toISOString().split('T')[0];
    const defaultBlocks: Timeblock[] = [
      {
        id: 'tb_1',
        title: 'Morning Focus: JARVIS Autonomous Master Studio Sprint',
        type: 'deep_work',
        date: today,
        startTime: '08:30',
        endTime: '11:30',
        completed: true,
      },
      {
        id: 'tb_2',
        title: 'LET Licensure Mathematics Curriculum Review Session',
        type: 'study',
        date: today,
        startTime: '13:30',
        endTime: '15:30',
        completed: false,
      },
      {
        id: 'tb_3',
        title: 'Tuklas Learning Engine Architecture Sync & Verification',
        type: 'coding',
        date: today,
        startTime: '16:00',
        endTime: '17:30',
        completed: false,
      },
    ];

    for (const b of defaultBlocks) {
      this.blocks.set(b.id, b);
    }
  }
}
