declare module '@pgswe/ics.js' {
  export class ICS {
    constructor();
    addEvent(event: {
      title: string;
      description?: string;
      start: Date;
      end: Date;
      location?: string;
    }): void;
    toString(): string;
  }
}
