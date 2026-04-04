import { masterStore } from "./UserProfile";


export function Dashboard() {
  // 100% Type Safe Destructuring
  const { get, set } = masterStore();

  return (
    <div style={{ padding: "20px", border: "2px solid black" }}>
      <h2>Master Dashboard</h2>

      {/* Typed: get().Ui.[Key].[Prop] */}
      <p>User Name: {get().Ui.user.name}</p>
      <p>Total Likes: {get().Ui.social.likes}</p>

      <button
        onClick={() => {
          // Typed: set({ [Key]: { [Prop]: Value } })
          set({
            user: { name: "Master Updated" },
            social: { likes: 999 },
          });
        }}
      >
        Update Everything
      </button>
    </div>
  );
}
