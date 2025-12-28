import { ModeLoader } from "../../../ui/shell/ModeLoader";

export default function WorkspacePage({ params }) {
  return <ModeLoader mode={params.mode} />;
}
