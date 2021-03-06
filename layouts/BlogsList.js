import { useState } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import Pagination from '@/components/Pagination'
import formatDate from '@/lib/utils/formatDate'
import PageTitle from '@/components/PageTitle'

export default function ListLayout({ posts, title, initialDisplayPosts = [], pagination }) {
  const [searchValue, setSearchValue] = useState('')
  const filteredBlogPosts = posts.filter((frontMatter) => {
    const searchContent = frontMatter.title + frontMatter.summary + frontMatter.tags.join(' ')
    return searchContent.toLowerCase().includes(searchValue.toLowerCase())
  })

  const { t } = useTranslation()
  const { locale } = useRouter()

  // If initialDisplayPosts exist, display it if no searchValue is specified
  const displayPosts =
    initialDisplayPosts.length > 0 && !searchValue ? initialDisplayPosts : filteredBlogPosts

  return (
    <>
      <div className="divide-y divide-transparent">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <PageTitle>{title}</PageTitle>
          <div className="relative max-w-lg">
            <input
              aria-label="Search articles"
              type="text"
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={t('common:search')}
              className="block w-full rounded-md border border-neutral-300 bg-white px-4 py-2 text-neutral-900 focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <svg
              className="absolute right-3 top-3 h-5 w-5 text-neutral-400 dark:text-neutral-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <ul>
          {!filteredBlogPosts.length && 'No posts found.'}
          {displayPosts.map((frontMatter) => {
            const { slug, date, title, summary, tags } = frontMatter
            return (
              <li key={slug} className="py-4">
                <article className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                  <dl>
                    <dt className="sr-only">{t('common:pub')}</dt>
                    <dd className="text-base font-medium leading-6 text-neutral-500 dark:text-neutral-400">
                      <time dateTime={date}>{formatDate(date, locale)}</time>
                    </dd>
                  </dl>
                  <div className="space-y-3 xl:col-span-3">
                    <div>
                      <h3 className="text-2xl font-bold leading-8 tracking-tight">
                        <Link
                          href={`/blog/${slug}`}
                          className="text-neutral-900 dark:text-neutral-100"
                        >
                          {title}
                        </Link>
                      </h3>
                      <div className="flex flex-wrap">
                        {tags.map((tag) => (
                          <Tag key={tag} text={tag} />
                        ))}
                      </div>
                    </div>
                    <div className="prose max-w-none text-neutral-500 dark:text-neutral-400">
                      {summary}
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      {pagination && pagination.totalPages > 1 && !searchValue && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          pageSlug={'blog'}
        />
      )}
    </>
  )
}
