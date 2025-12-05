"use client";

export function ThemeToggle() {
  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm rounded-full px-4">
        Färgtema
        <svg
          width="12px"
          height="12px"
          className="inline-block h-2 w-2 fill-current opacity-60"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048"
        >
          <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
        </svg>
      </div>

      <ul
        tabIndex={-1}
        className="dropdown-content bg-base-300 rounded-box z-50 w-56 p-2 shadow-2xl max-h-[50vh] overflow-y-auto right-0 left-auto"
      >
        {/* --- Light & Dark först --- */}
        {[
          { label: "Light", value: "light" },
          { label: "Dark", value: "dark" },
        ].map((t) => (
          <li key={t.value}>
            <input
              type="radio"
              name="theme-dropdown"
              className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
              aria-label={t.label}
              value={t.value}
            />
          </li>
        ))}

        <div className="divider my-1"></div>

        {/* --- Resten i alfabetisk ordning --- */}
        {[
          "abyss",
          "acid",
          "aqua",
          "autumn",
          "bumblebee",
          "business",
          "caramellatte",
          "cmyk",
          "corporate",
          "cupcake",
          "cyberpunk",
          "dim",
          "dracula",
          "emerald",
          "fantasy",
          "forest",
          "garden",
          "halloween",
          "lemonade",
          "lofi",
          "luxury",
          "night",
          "nord",
          "pastel",
          "retro",
          "silk",
          "sunset",
          "synthwave",
          "valentine",
          "winter",
          "coffee",
          "black",
        ]
          .sort((a, b) => a.localeCompare(b))
          .map((theme) => (
            <li key={theme}>
              <input
                type="radio"
                name="theme-dropdown"
                className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start capitalize"
                aria-label={theme}
                value={theme}
              />
            </li>
          ))}
      </ul>
    </div>
  );
}
