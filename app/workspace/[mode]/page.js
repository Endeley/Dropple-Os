import { ModeLoader } from '../../../ui/workspace/shell/ModeLoader';

export default async function WorkspacePage({ params, searchParams }) {
    const { mode } = await params;
    const resolvedSearchParams = (await searchParams) ?? {};
    return <ModeLoader mode={mode} queryMode={resolvedSearchParams.mode ?? null} />;
}
