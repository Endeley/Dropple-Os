export const uiuxWorkspace = {
  id: "uiux",
  label: "UI / UX Design",
  extends: "graphic",
  engines: ["nodeTree", "layout", "constraints", "autoLayout"],
  tools: ["select", "move", "resize", "text", "shape", "image"],
  panels: ["layers", "properties", "tokens"],
  export: {
    formats: ["react", "html", "css"],
  },
};
