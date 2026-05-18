export const dynamic = "force-dynamic";

import { getMonthActivity } from "@/lib/actions/calendar";
import { CalendarView } from "./calendar-view";

export default async function CalendarioPage() {
  const now = new Date();
  const initialActivity = await getMonthActivity(
    now.getFullYear(),
    now.getMonth() + 1
  );

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Calendario</h1>
        <p className="text-gray-400 text-sm mt-1">
          Clickea en un dia para ver el resumen completo
        </p>
      </div>
      <CalendarView
        initialActivity={initialActivity}
        initialYear={now.getFullYear()}
        initialMonth={now.getMonth()}
      />
    </div>
  );
}
