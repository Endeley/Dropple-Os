'use client';

function formatDate(value) {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleString();
}

export default function AssessmentContent({ submission }) {
  const questions = submission?.content?.questions ?? [];
  const files = submission?.content?.files ?? [];

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-500">Submission</h2>
        <div className="mt-3 grid gap-2 text-sm text-slate-700">
          <div>
            <span className="font-medium text-slate-900">Submitter:</span>{' '}
            {submission.submittedBy}
          </div>
          <div>
            <span className="font-medium text-slate-900">Assessment:</span>{' '}
            {submission.assessmentTitle}
          </div>
          <div>
            <span className="font-medium text-slate-900">Submitted:</span>{' '}
            {formatDate(submission.submittedAt)}
          </div>
          <div>
            <span className="font-medium text-slate-900">Submission ID:</span>{' '}
            {submission.submissionId}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-500">
          Assessment Responses
        </h2>
        <div className="mt-4 space-y-4">
          {questions.length === 0 ? (
            <div className="text-sm text-slate-500">No responses provided.</div>
          ) : (
            questions.map((question, index) => (
              <div
                key={question.id || index}
                className="rounded-md border border-slate-100 bg-slate-50 p-4"
              >
                <div className="text-xs font-semibold text-slate-500">
                  Question {index + 1}
                </div>
                <div className="mt-2 text-sm font-medium text-slate-900">
                  {question.prompt}
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  {question.answer || 'No response provided.'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-500">Uploaded Files</h2>
        <div className="mt-3 space-y-2 text-sm text-slate-700">
          {files.length === 0 ? (
            <div className="text-sm text-slate-500">No files uploaded.</div>
          ) : (
            files.map((file, index) => (
              file.url ? (
                <a
                  key={`${file.name}-${index}`}
                  href={file.url}
                  className="block rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-slate-700 hover:border-slate-200 hover:text-slate-900"
                >
                  {file.name}
                </a>
              ) : (
                <div
                  key={`${file.name}-${index}`}
                  className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-slate-700"
                >
                  {file.name}
                </div>
              )
            ))
          )}
        </div>
      </div>
    </section>
  );
}
