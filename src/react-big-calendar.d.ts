declare module 'react-big-calendar' {
  import { ComponentType } from 'react';

  export interface CalendarProps {
    localizer: any;
    events: any[];
    startAccessor: string;
    endAccessor: string;
    style?: React.CSSProperties;
    eventPropGetter?: (event: any) => { style?: React.CSSProperties };
    onSelectEvent?: (event: any) => void;
    culture?: string;
    messages?: {
      next?: string;
      previous?: string;
      today?: string;
      month?: string;
      week?: string;
      day?: string;
      agenda?: string;
      date?: string;
      time?: string;
      event?: string;
      noEventsInRange?: string;
      showMore?: (total: number) => string;
    };
  }

  export const Calendar: ComponentType<CalendarProps>;
  
  export function dateFnsLocalizer(config: {
    format: any;
    parse: any;
    startOfWeek: any;
    getDay: any;
    locales: any;
  }): any;
}
