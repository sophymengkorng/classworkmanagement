import { AppShell } from "../components/app-shell";
import { classInfo, courseCatalog, formattedDate, schedule, semesterEvents } from "../data";

export default function SchedulePage() {
  return (
    <AppShell title="SW35 (E-T) Schedule" eyebrow={`${classInfo.school} - ${classInfo.year}, ${classInfo.semester}`}>
      <section className="mb-4 rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:mb-5 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {[
            ["Group", classInfo.group],
            ["Year", classInfo.year],
            ["Semester", classInfo.semester],
            ["Start Date", formattedDate(classInfo.termStart)],
            ["Effective From", formattedDate(classInfo.effectiveFrom)],
            ["Sheet", classInfo.sheetPage],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-[#f8faf7] p-4">
              <p className="text-sm font-semibold text-[#68736f]">{label}</p>
              <p className="mt-1 text-lg font-bold text-[#24312f]">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {schedule.map((day) => (
          <section key={day.day} className="rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:p-5">
            <h3 className="text-xl font-bold">{day.day}</h3>
            <div className="mt-4 space-y-3">
              {day.classes.map((item) => (
                <div key={`${day.day}-${item.time}`} className="rounded-lg bg-[#fbfbf8] p-4">
                  <p className="text-sm font-bold text-[#68736f]">{item.time}</p>
                  <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-lg font-bold">{item.subject}</p>
                    <p className="text-sm font-semibold text-[#4d5a56]">Room {item.room}</p>
                  </div>
                  <p className="mt-1 text-sm text-[#68736f]">Lecturer: {item.teacher}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:mt-5 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-5">
        <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-xl font-bold">Course Lecturers</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {courseCatalog.map((course) => (
              <div key={course.code} className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-3 rounded-lg border border-black/8 p-3 sm:grid-cols-[80px_1fr_auto]">
                <p className="font-bold text-[#24312f]">{course.code}</p>
                <p className="text-sm font-semibold text-[#4d5a56]">{course.lecturer}</p>
                <p className="col-span-2 w-fit rounded-full bg-[#fff9eb] px-2.5 py-1 text-xs font-bold text-[#8a6500] sm:col-span-1">
                  {course.unit}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-xl font-bold">Semester Dates</h3>
          <div className="mt-4 space-y-3">
            {semesterEvents.map((event) => (
              <div key={event.label} className="rounded-lg bg-[#fbfbf8] p-4">
                <p className="font-bold">{event.label}</p>
                <p className="mt-1 text-sm font-semibold text-[#68736f]">{event.date}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
