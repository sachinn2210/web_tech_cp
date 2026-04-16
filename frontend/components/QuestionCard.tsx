import Link from 'next/link';

interface Tag {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface Question {
  id: number;
  title: string;
  content: string;
  slug: string;
  created_at: string;
  updated_at: string;
  vote_score: number;
  answer_count: number;
  category: Category;
  tags: Tag[];
  author: {
    username: string;
  };
  time_since: string;
}

interface QuestionCardProps {
  question: Question;
  onVote?: (id: number, direction: 'up' | 'down') => void;
}

export default function QuestionCard({ question, onVote }: QuestionCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex gap-4">
        {/* Vote Section */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => onVote?.(question.id, 'up')}
            className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
          >
            <svg className="w-6 h-6 text-gray-400 group-hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <span className={`font-bold text-lg ${question.vote_score > 0 ? 'text-green-600' : question.vote_score < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {question.vote_score}
          </span>
          <button
            onClick={() => onVote?.(question.id, 'down')}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
          >
            <svg className="w-6 h-6 text-gray-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <Link href={`/question/${question.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
              {question.title}
            </h3>
          </Link>

          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {question.content}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {question.tags?.slice(0, 4).map((tag) => (
              <span
                key={tag.id}
                className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full hover:bg-blue-100 transition-colors cursor-pointer"
              >
                #{tag.name}
              </span>
            ))}
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                {question.category?.name}
              </span>
              <Link
                href={`/profile/${question.author?.username}`}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Posted by <span className="font-medium">{question.author?.username}</span>
              </Link>
              <span className="text-xs text-gray-400">{question.time_since || question.created_at}</span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{question.answer_count || 0} answers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
