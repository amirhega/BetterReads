import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getWork } from '@/lib/openLibrary/works';
import { getCoverUrl } from '@/lib/openLibrary/covers';

export function BookPage() {
  const { olWorkKey } = useParams();
  const workKey = `/works/${olWorkKey}`;

  const { data, isLoading, error } = useQuery({
    queryKey: ['work', workKey],
    queryFn: () => getWork(workKey),
    enabled: !!olWorkKey,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted text-lg">Book not found</p>
        <Link to="/search" className="text-accent-primary mt-4 inline-block">
          Back to search
        </Link>
      </div>
    );
  }

  const { work, description } = data;
  const coverId = work.covers?.[0];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Cover */}
        <div className="shrink-0">
          {coverId ? (
            <img
              src={getCoverUrl(coverId, 'L')}
              alt={work.title}
              className="w-48 sm:w-56 rounded-lg shadow-xl"
            />
          ) : (
            <div className="w-48 sm:w-56 h-72 sm:h-80 bg-surface-raised rounded-lg flex items-center justify-center">
              <span className="text-text-muted text-4xl">?</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold font-display">{work.title}</h1>

          {work.subjects && work.subjects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {work.subjects.slice(0, 8).map((subject) => (
                <span
                  key={subject}
                  className="px-2 py-1 bg-surface-raised text-text-muted text-xs rounded-full border border-surface-overlay"
                >
                  {subject}
                </span>
              ))}
            </div>
          )}

          {description && (
            <div className="text-text-secondary leading-relaxed">
              <p>{description.length > 500 ? description.slice(0, 500) + '...' : description}</p>
            </div>
          )}

          {/* Action buttons placeholder */}
          <div className="flex flex-wrap gap-3 pt-4">
            <button className="bg-accent-primary text-surface px-6 py-2 rounded-lg font-medium hover:bg-accent-primary/90 transition-colors">
              Want to Read
            </button>
            <button className="bg-surface-raised text-text-secondary px-6 py-2 rounded-lg font-medium hover:bg-surface-overlay transition-colors border border-surface-overlay">
              Write Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
