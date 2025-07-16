export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("shift_planner_access_token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}
