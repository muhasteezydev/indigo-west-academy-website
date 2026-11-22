import React, { useState, useMemo } from 'react';
import {
  Users,
  Award,
  GraduationCap,
  Quote,
  Search,
  Sparkles,
} from 'lucide-react';
import type { Teacher } from '../types/domain';

interface TeachersSectionProps {
  teachers: Teacher[];
}

const DEPARTMENTS = [
  'Все кафедры',
  'STEM & Олимпиады',
  'Языки & IELTS/SAT',
  'Гуманитарные науки',
  'Начальная и средняя школа',
] as const;

export const TeachersSection: React.FC<TeachersSectionProps> = ({ teachers }) => {
  const [selectedDept, setSelectedDept] = useState<string>('Все кафедры');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchesDept =
        selectedDept === 'Все кафедры' || t.department === selectedDept;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t.full_name.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.bio.toLowerCase().includes(q);
      return matchesDept && matchesSearch;
    });
  }, [teachers, selectedDept, searchQuery]);

  return (
    <section
      id="teachers"
      className="relative border-t border-white/10 bg-[#080C22]/70 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header & Search */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-amber-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300 border border-amber-400/20">
              <Users className="h-3.5 w-3.5" />
              <span>Раздел 02 • Академическое лидерство</span>
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Учительский состав Indigo Academy West
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
              Наставники республиканских олимпиадников, эксперты международной сертификации
              CELTA/SAT и авторы экзаменационных модулей IQA.
            </p>
          </div>

          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по имени или предмету..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pr-4 pl-10 text-sm text-white placeholder-slate-400 focus:border-indigo-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Department Tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                selectedDept === dept
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Faculty Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="group glass-card glass-card-hover flex flex-col justify-between overflow-hidden rounded-3xl p-6"
            >
              <div>
                {/* Top Profile Row */}
                <div className="flex items-start gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-indigo-400/30">
                    <img
                      src={teacher.photo_url}
                      alt={teacher.full_name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="inline-block rounded-md bg-indigo-500/20 px-2 py-0.5 text-[11px] font-semibold text-indigo-300">
                      {teacher.department}
                    </span>
                    <h3 className="mt-1 text-lg font-extrabold text-white">
                      {teacher.full_name}
                    </h3>
                    <p className="text-xs font-semibold text-amber-300">
                      {teacher.subject}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Стаж: {teacher.experience_years} лет
                    </p>
                  </div>
                </div>

                {/* Role & Bio */}
                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-200">
                    {teacher.role_title}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    {teacher.bio}
                  </p>
                </div>

                {/* Education */}
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-300">
                  <GraduationCap className="h-4 w-4 shrink-0 text-indigo-400" />
                  <span className="truncate">{teacher.education}</span>
                </div>

                {/* Achievements */}
                {teacher.achievements.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    {teacher.achievements.map((ach, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-slate-300"
                      >
                        <Award className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Teacher Quote Footer */}
              <div className="mt-5 border-t border-white/10 pt-4">
                <div className="flex items-start gap-2 text-xs italic text-indigo-200/90">
                  <Quote className="h-4 w-4 shrink-0 text-indigo-400" />
                  <span>«{teacher.quote}»</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
