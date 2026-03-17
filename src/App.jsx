import { useState, useEffect } from "react";

// ── Constants ────────────────────────────────────────────────────────────────
const CHURCH_NAVY   = "#003E7E";
const CHURCH_BLUE   = "#0057B8";
const CHURCH_GOLD   = "#C5A028";
const CHURCH_LIGHT  = "#E8F0F9";
const CHURCH_GRAY   = "#F4F6FA";
const WHITE         = "#FFFFFF";
const TEXT_DARK     = "#1A1A2E";
const TEXT_MID      = "#4A5568";
const TEXT_LIGHT    = "#718096";
const SUCCESS       = "#2E7D32";
const BORDER        = "#D1DCF0";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM – 10 PM
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_FULL   = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const CATEGORY_COLORS = [
  { label: "Lesson",    bg: "#DBEAFE", border: "#2563EB", text: "#1E3A8A" },
  { label: "Finding",   bg: "#D1FAE5", border: "#059669", text: "#064E3B" },
  { label: "Service",   bg: "#FEF3C7", border: "#D97706", text: "#78350F" },
  { label: "Study",     bg: "#EDE9FE", border: "#7C3AED", text: "#3B0764" },
  { label: "Meeting",   bg: "#FCE7F3", border: "#DB2777", text: "#831843" },
  { label: "Other",     bg: "#F1F5F9", border: "#64748B", text: "#1E293B" },
];

const formatHour = (h) => {
  const s = h >= 12 ? "PM" : "AM";
  const d = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${d}:00 ${s}`;
};

const formatShort = (h) => {
  const s = h >= 12 ? "p" : "a";
  const d = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${d}${s}`;
};

// ── Sub-components ───────────────────────────────────────────────────────────
function StatBadge({ label, value, color }) {
  return (
    <div style={{
      background: WHITE, border: `1px solid ${BORDER}`,
      borderRadius: 10, padding: "10px 14px", minWidth: 80, textAlign: "center",
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: color }}>{value}</div>
      <div style={{ fontSize: 10, color: TEXT_LIGHT, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
    </div>
  );
}

function GoalRow({ goal, onToggle, onDelete }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 12px", borderRadius: 8,
      background: goal.done ? "#F0FDF4" : WHITE,
      border: `1px solid ${goal.done ? "#86EFAC" : BORDER}`,
      marginBottom: 6,
    }}>
      <button onClick={() => onToggle(goal.id)} style={{
        width: 20, height: 20, borderRadius: 4, flexShrink: 0,
        border: `2px solid ${goal.done ? SUCCESS : CHURCH_BLUE}`,
        background: goal.done ? SUCCESS : "transparent",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {goal.done && <span style={{ color: WHITE, fontSize: 12, fontWeight: 700 }}>✓</span>}
      </button>
      <span style={{ flex: 1, fontSize: 13, color: goal.done ? TEXT_LIGHT : TEXT_DARK,
        textDecoration: goal.done ? "line-through" : "none" }}>
        {goal.text}
      </span>
      <button onClick={() => onDelete(goal.id)} style={{
        background: "none", border: "none", color: TEXT_LIGHT,
        cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 2px",
      }}>×</button>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function PMGPlanner() {
  const today = new Date();
  const todayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;

  const [selectedDay, setSelectedDay] = useState(todayIdx);
  const [tasks, setTasks] = useState({});
  const [goals, setGoals] = useState([]);
  const [goalInput, setGoalInput] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [modal, setModal] = useState(null);    // { hour, day } — new task
  const [editModal, setEditModal] = useState(null); // existing task
  const [form, setForm] = useState({ title: "", duration: 1, category: 0, note: "" });
  const [activeTab, setActiveTab] = useState("schedule"); // schedule | goals | notes
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const dayTasks = Object.values(tasks).filter((t) => t.day === selectedDay);
  const getTaskAt = (hour, day) =>
    Object.values(tasks).find((t) => t.day === day && t.hour <= hour && t.hour + t.duration > hour);

  const openNew = (hour) => {
    if (getTaskAt(hour, selectedDay)) return;
    setForm({ title: "", duration: 1, category: 0, note: "" });
    setModal({ hour, day: selectedDay });
  };

  const saveTask = () => {
    if (!form.title.trim()) return;
    const id = Date.now().toString();
    setTasks((p) => ({ ...p, [id]: { id, day: modal.day, hour: modal.hour, ...form } }));
    setModal(null);
  };

  const updateTask = () => {
    if (!form.title.trim()) return;
    setTasks((p) => ({ ...p, [editModal.id]: { ...editModal, ...form } }));
    setEditModal(null);
  };

  const deleteTask = (id) => {
    setTasks((p) => { const n = { ...p }; delete n[id]; return n; });
    setEditModal(null);
  };

  const addGoal = () => {
    if (!goalInput.trim()) return;
    setGoals((g) => [...g, { id: Date.now(), text: goalInput.trim(), done: false }]);
    setGoalInput("");
  };

  const toggleGoal = (id) =>
    setGoals((g) => g.map((x) => x.id === id ? { ...x, done: !x.done } : x));

  const deleteGoal = (id) => setGoals((g) => g.filter((x) => x.id !== id));

  const nowH = currentTime.getHours();
  const nowM = currentTime.getMinutes();
  const nowOffset = ((nowH - 6) + nowM / 60) / 17 * 100;

  const completedGoals = goals.filter((g) => g.done).length;
  const totalGoals = goals.length;

  // Key indicator counts
  const lessonCount = dayTasks.filter((t) => t.category === 0).length;
  const findingCount = dayTasks.filter((t) => t.category === 1).length;

  return (
    <div style={{
      minHeight: "100vh",
      background: CHURCH_GRAY,
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      color: TEXT_DARK,
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ── Top Nav Bar ── */}
      <div style={{
        background: CHURCH_NAVY,
        padding: "0 0 0 0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
      }}>
        {/* Logo row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 20px 10px",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: CHURCH_GOLD,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 16, color: CHURCH_NAVY,
            flexShrink: 0,
          }}>
            PMG
          </div>
          <div>
            <div style={{ color: WHITE, fontWeight: 700, fontSize: 16, lineHeight: 1.1 }}>
              Daily Planner
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>
              {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ color: CHURCH_GOLD, fontWeight: 700, fontSize: 18 }}>
              {currentTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </div>
          </div>
        </div>

        {/* Day selector */}
        <div style={{ display: "flex", paddingTop: 4 }}>
          {DAY_LABELS.map((label, i) => {
            const isSelected = i === selectedDay;
            const isToday = i === todayIdx;
            const count = Object.values(tasks).filter((t) => t.day === i).length;
            return (
              <button key={i} onClick={() => setSelectedDay(i)} style={{
                flex: 1, padding: "8px 4px 10px",
                background: isSelected ? WHITE : "transparent",
                border: "none",
                borderTop: isSelected ? `3px solid ${CHURCH_GOLD}` : "3px solid transparent",
                color: isSelected ? CHURCH_NAVY : isToday ? CHURCH_GOLD : "rgba(255,255,255,0.7)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: isSelected || isToday ? 700 : 400,
                fontSize: 12,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                transition: "all 0.15s",
              }}>
                <span style={{ letterSpacing: 0.5 }}>{label}</span>
                {count > 0 && (
                  <span style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: isSelected ? CHURCH_BLUE : CHURCH_GOLD,
                    display: "inline-block",
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Key Indicators Row ── */}
      <div style={{
        background: WHITE,
        borderBottom: `1px solid ${BORDER}`,
        padding: "12px 16px",
        display: "flex",
        gap: 8,
        overflowX: "auto",
      }}>
        <StatBadge label="Lessons" value={lessonCount} color={CHURCH_BLUE} />
        <StatBadge label="Finding" value={findingCount} color={SUCCESS} />
        <StatBadge label="Tasks"   value={dayTasks.length} color={CHURCH_NAVY} />
        <StatBadge label="Goals"   value={`${completedGoals}/${totalGoals || 0}`} color={CHURCH_GOLD} />
        <div style={{ flex: 1 }} />
        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "center",
          alignItems: "flex-end", fontSize: 11, color: TEXT_LIGHT,
        }}>
          <span style={{ fontWeight: 600, color: CHURCH_NAVY }}>
            {DAY_FULL[selectedDay]}
          </span>
          <span>Daily Schedule</span>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div style={{
        display: "flex", background: WHITE,
        borderBottom: `2px solid ${BORDER}`,
      }}>
        {[
          { id: "schedule", icon: "📅", label: "Schedule" },
          { id: "goals",    icon: "🎯", label: "Goals" },
          { id: "notes",    icon: "📝", label: "Notes" },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: "10px 8px",
            background: "transparent", border: "none",
            borderBottom: activeTab === tab.id ? `2px solid ${CHURCH_BLUE}` : "2px solid transparent",
            marginBottom: -2,
            color: activeTab === tab.id ? CHURCH_BLUE : TEXT_LIGHT,
            fontWeight: activeTab === tab.id ? 700 : 400,
            fontFamily: "inherit", fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          }}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>

        {/* SCHEDULE TAB */}
        {activeTab === "schedule" && (
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <div style={{ position: "relative" }}>
              {/* Time line */}
              {selectedDay === todayIdx && nowH >= 6 && nowH <= 22 && (
                <div style={{
                  position: "absolute",
                  top: `${nowOffset}%`,
                  left: 0, right: 0,
                  display: "flex", alignItems: "center",
                  zIndex: 20, pointerEvents: "none",
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: CHURCH_BLUE, flexShrink: 0, marginLeft: 60 }} />
                  <div style={{ flex: 1, height: 2, background: CHURCH_BLUE, opacity: 0.8 }} />
                  <div style={{
                    fontSize: 10, color: WHITE, background: CHURCH_BLUE,
                    padding: "2px 6px", borderRadius: 4, marginRight: 4, whiteSpace: "nowrap"
                  }}>
                    {currentTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </div>
                </div>
              )}

              {HOURS.map((hour) => {
                const task = getTaskAt(hour, selectedDay);
                const isStart = task && task.hour === hour;
                const isContinuation = task && task.hour !== hour;
                const cat = task ? CATEGORY_COLORS[task.category] : null;
                const isPast = selectedDay === todayIdx && hour < nowH;

                return (
                  <div key={hour} style={{
                    display: "flex",
                    minHeight: 60,
                    borderTop: `1px solid ${BORDER}`,
                    background: isPast ? "rgba(0,0,0,0.015)" : "transparent",
                  }}>
                    {/* Hour label */}
                    <div style={{
                      width: 60, flexShrink: 0,
                      padding: "8px 10px 0 0",
                      textAlign: "right",
                      fontSize: 11,
                      fontWeight: hour % 2 === 0 ? 600 : 400,
                      color: isPast ? TEXT_LIGHT : TEXT_MID,
                    }}>
                      {formatShort(hour)}
                    </div>

                    {/* Block */}
                    <div
                      onClick={() => !task && openNew(hour)}
                      style={{
                        flex: 1,
                        padding: "4px 8px",
                        cursor: task ? "default" : "pointer",
                        position: "relative",
                        minHeight: 60,
                      }}
                    >
                      {isStart && (
                        <div
                          onClick={(e) => { e.stopPropagation(); setForm({ title: task.title, duration: task.duration, category: task.category, note: task.note || "" }); setEditModal(task); }}
                          style={{
                            background: cat.bg,
                            border: `1.5px solid ${cat.border}`,
                            borderLeft: `4px solid ${cat.border}`,
                            borderRadius: 6,
                            padding: "8px 12px",
                            cursor: "pointer",
                            minHeight: task.duration * 60 - 10,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                            transition: "box-shadow 0.15s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,0.15)"}
                          onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.08)"}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                              color: cat.border, textTransform: "uppercase",
                              background: WHITE, padding: "1px 6px", borderRadius: 4,
                              border: `1px solid ${cat.border}`,
                            }}>
                              {CATEGORY_COLORS[task.category].label}
                            </span>
                            <span style={{ fontSize: 10, color: TEXT_LIGHT }}>
                              {formatShort(task.hour)}–{formatShort(task.hour + task.duration)}
                            </span>
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: cat.text, marginTop: 4 }}>
                            {task.title}
                          </div>
                          {task.note && (
                            <div style={{ fontSize: 12, color: TEXT_MID, marginTop: 2 }}>
                              {task.note}
                            </div>
                          )}
                        </div>
                      )}
                      {isContinuation && (
                        <div style={{
                          height: "100%", borderLeft: `4px solid ${cat.border}`,
                          background: cat.bg + "55",
                          borderRadius: "0 4px 4px 0",
                          minHeight: 60,
                        }} />
                      )}
                      {!task && (
                        <div style={{
                          position: "absolute", inset: 0,
                          display: "flex", alignItems: "center",
                          paddingLeft: 12, color: TEXT_LIGHT,
                          fontSize: 12, opacity: 0,
                          transition: "opacity 0.15s",
                        }}
                          className="add-hint"
                        >
                          + Add appointment
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* GOALS TAB */}
        {activeTab === "goals" && (
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{
              background: WHITE, borderRadius: 10, border: `1px solid ${BORDER}`,
              padding: "16px", marginBottom: 16,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: CHURCH_NAVY, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                Daily Goals — {DAY_FULL[selectedDay]}
              </div>

              {/* Progress bar */}
              {totalGoals > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: TEXT_LIGHT, marginBottom: 4 }}>
                    <span>Progress</span>
                    <span>{completedGoals} of {totalGoals} complete</span>
                  </div>
                  <div style={{ background: CHURCH_LIGHT, borderRadius: 4, height: 8, overflow: "hidden" }}>
                    <div style={{
                      width: `${totalGoals ? (completedGoals / totalGoals) * 100 : 0}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, ${CHURCH_BLUE}, ${CHURCH_GOLD})`,
                      borderRadius: 4,
                      transition: "width 0.4s ease",
                    }} />
                  </div>
                </div>
              )}

              {goals.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px 0", color: TEXT_LIGHT, fontSize: 13 }}>
                  No goals set. Add one below!
                </div>
              )}

              {goals.map((g) => (
                <GoalRow key={g.id} goal={g} onToggle={toggleGoal} onDelete={deleteGoal} />
              ))}

              {/* Add goal */}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <input
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addGoal()}
                  placeholder="Add a goal for this day..."
                  style={{
                    flex: 1, padding: "8px 12px",
                    border: `1px solid ${BORDER}`, borderRadius: 8,
                    fontFamily: "inherit", fontSize: 13, outline: "none",
                    background: CHURCH_GRAY,
                  }}
                />
                <button onClick={addGoal} style={{
                  padding: "8px 16px",
                  background: CHURCH_NAVY, color: WHITE,
                  border: "none", borderRadius: 8,
                  cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                }}>
                  Add
                </button>
              </div>
            </div>

            {/* Scripture of day */}
            <div style={{
              background: `linear-gradient(135deg, ${CHURCH_NAVY} 0%, ${CHURCH_BLUE} 100%)`,
              borderRadius: 10, padding: "16px 20px", color: WHITE,
            }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: CHURCH_GOLD, textTransform: "uppercase", marginBottom: 8 }}>
                Daily Reflection
              </div>
              <div style={{ fontSize: 13, fontStyle: "italic", lineHeight: 1.6, opacity: 0.9 }}>
                "Trust in the Lord with all thine heart; and lean not unto thine own understanding."
              </div>
              <div style={{ fontSize: 11, color: CHURCH_GOLD, marginTop: 8 }}>— Proverbs 3:5</div>
            </div>
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === "notes" && (
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{
              background: WHITE, borderRadius: 10, border: `1px solid ${BORDER}`,
              padding: "16px",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: CHURCH_NAVY, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                Notes — {DAY_FULL[selectedDay]}
              </div>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Record impressions, plans, or notes for today…"
                rows={12}
                style={{
                  width: "100%",
                  background: "#FAFBFF",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: "12px",
                  fontFamily: "'Georgia', serif",
                  fontSize: 14,
                  lineHeight: 1.7,
                  resize: "vertical",
                  outline: "none",
                  color: TEXT_DARK,
                  boxSizing: "border-box",
                }}
              />
              <div style={{ textAlign: "right", fontSize: 11, color: TEXT_LIGHT, marginTop: 6 }}>
                {noteText.length} characters
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Action Bar ── */}
      <div style={{
        background: WHITE, borderTop: `1px solid ${BORDER}`,
        padding: "10px 16px",
        display: "flex", gap: 10, justifyContent: "flex-end",
      }}>
        {activeTab === "schedule" && (
          <button
            onClick={() => { setForm({ title: "", duration: 1, category: 0, note: "" }); setModal({ hour: Math.max(6, Math.min(22, currentTime.getHours())), day: selectedDay }); }}
            style={{
              padding: "10px 20px",
              background: CHURCH_NAVY, color: WHITE,
              border: "none", borderRadius: 8,
              cursor: "pointer", fontFamily: "inherit",
              fontSize: 14, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <span style={{ fontSize: 18 }}>+</span> Add Appointment
          </button>
        )}
      </div>

      {/* ── Modal ── */}
      {(modal || editModal) && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "flex-end",
          zIndex: 200,
        }}
          onClick={() => { setModal(null); setEditModal(null); }}
        >
          <div
            style={{
              background: WHITE, width: "100%",
              borderRadius: "16px 16px 0 0",
              padding: "20px 20px 32px",
              maxWidth: 560, margin: "0 auto",
              maxHeight: "85vh", overflowY: "auto",
              animation: "slideUp 0.25s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{ width: 40, height: 4, borderRadius: 2, background: BORDER, margin: "0 auto 20px" }} />

            <div style={{ fontSize: 11, letterSpacing: 2, color: CHURCH_NAVY, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>
              {editModal ? "Edit Appointment" : `New Appointment — ${formatHour(modal.hour)}`}
            </div>

            <input
              autoFocus
              placeholder="Appointment title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              style={{
                width: "100%", padding: "12px 0",
                border: "none", borderBottom: `2px solid ${CHURCH_BLUE}`,
                fontSize: 18, fontFamily: "inherit", outline: "none",
                color: TEXT_DARK, marginBottom: 20, boxSizing: "border-box",
              }}
              onKeyDown={(e) => e.key === "Enter" && (editModal ? updateTask() : saveTask())}
            />

            {/* Category */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: TEXT_LIGHT, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Category</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CATEGORY_COLORS.map((c, i) => (
                  <button key={i} onClick={() => setForm((f) => ({ ...f, category: i }))} style={{
                    padding: "6px 14px",
                    background: form.category === i ? c.bg : "transparent",
                    border: `1.5px solid ${form.category === i ? c.border : BORDER}`,
                    borderRadius: 20,
                    cursor: "pointer", fontFamily: "inherit",
                    fontSize: 12, fontWeight: form.category === i ? 700 : 400,
                    color: form.category === i ? c.text : TEXT_MID,
                  }}>{c.label}</button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: TEXT_LIGHT, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Duration</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[1, 2, 3, 4].map((d) => (
                  <button key={d} onClick={() => setForm((f) => ({ ...f, duration: d }))} style={{
                    padding: "8px 0", flex: 1,
                    background: form.duration === d ? CHURCH_NAVY : CHURCH_LIGHT,
                    color: form.duration === d ? WHITE : TEXT_MID,
                    border: "none", borderRadius: 8,
                    cursor: "pointer", fontFamily: "inherit",
                    fontSize: 13, fontWeight: 600,
                  }}>{d}h</button>
                ))}
              </div>
            </div>

            {/* Note */}
            <textarea
              placeholder="Notes or details (optional)"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              rows={2}
              style={{
                width: "100%", padding: "10px 12px",
                border: `1px solid ${BORDER}`, borderRadius: 8,
                fontFamily: "inherit", fontSize: 13,
                resize: "none", outline: "none",
                background: CHURCH_GRAY, color: TEXT_DARK,
                marginBottom: 20, boxSizing: "border-box",
              }}
            />

            <div style={{ display: "flex", gap: 10 }}>
              {editModal && (
                <button onClick={() => deleteTask(editModal.id)} style={{
                  padding: "12px 16px",
                  background: "#FEE2E2", color: "#B91C1C",
                  border: "1px solid #FCA5A5", borderRadius: 8,
                  cursor: "pointer", fontFamily: "inherit", fontSize: 13,
                }}>Delete</button>
              )}
              <button onClick={() => { setModal(null); setEditModal(null); }} style={{
                flex: 1, padding: "12px",
                background: CHURCH_LIGHT, color: CHURCH_NAVY,
                border: "none", borderRadius: 8,
                cursor: "pointer", fontFamily: "inherit", fontSize: 14,
              }}>Cancel</button>
              <button onClick={editModal ? updateTask : saveTask} style={{
                flex: 2, padding: "12px",
                background: CHURCH_NAVY, color: WHITE,
                border: "none", borderRadius: 8,
                cursor: "pointer", fontFamily: "inherit",
                fontSize: 14, fontWeight: 700,
              }}>
                {editModal ? "Save Changes" : "Add Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        div:hover > .add-hint { opacity: 1 !important; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 4px; }
        textarea:focus, input:focus { border-color: ${CHURCH_BLUE} !important; }
      `}</style>
    </div>
  );
}
