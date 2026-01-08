import { ModeLoader } from '../../../ui/shell/ModeLoader';

export default async function WorkspacePage({ params }) {
    const { mode } = await params;
    return <ModeLoader mode={mode} />;
}
