import useTranslation from 'next-translate/useTranslation'
import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata.mjs'
import { getAllTags } from '@/lib/tags'
import kebabCase from '@/lib/utils/kebabCase'

export async function getStaticProps({ defaultLocale, locale, locales }) {
  const otherLocale = locale !== defaultLocale ? locale : ''
  const tags = await getAllTags('blog', otherLocale)

  return { props: { tags, locale, availableLocales: locales } }
}

export default function Tags({ tags, locale, availableLocales }) {
  const sortedTags = Object.keys(tags).sort((a, b) => tags[b] - tags[a])
  const { t } = useTranslation()
  return (
    <>
      <PageSEO
        title={`${t('headerNavLinks:tags')} - ${siteMetadata.author}`}
        description={t('SEO:tags')}
        availableLocales={availableLocales}
      />
      <div className="flex flex-col items-start justify-start divide-y divide-neutral-200 dark:divide-neutral-700 md:justify-center md:items-center md:divide-y-0 md:flex-row md:space-x-6 md:mt-24">
        <div className="pt-6 pb-8 space-x-2 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 md:border-r-2 md:px-6">
            Tags
          </h1>
        </div>
        <div className="flex flex-wrap max-w-lg">
          {Object.keys(tags).length === 0 && 'No tags found.'}
          {sortedTags.map((t) => {
            return (
              <div key={t} className="mt-2 mb-2 mr-5">
                <Tag text={t} />
                <Link
                  href={`/tags/${kebabCase(t)}`}
                  className="-ml-2 text-sm font-semibold text-neutral-600 uppercase dark:text-neutral-300"
                >
                  {` (${tags[t]})`}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
