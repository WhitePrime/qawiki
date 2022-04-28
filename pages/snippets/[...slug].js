import fs from 'fs'
import useTranslation from 'next-translate/useTranslation'
import PageTitle from '@/components/PageTitle'
import generateRss from '@/lib/generate-rss'
import { MDXLayoutRenderer } from '@/components/MDXComponents'
import { formatSlug, getAllFilesFrontMatter, getFileBySlug, getFiles } from '@/lib/mdx'

const DEFAULT_LAYOUT = 'Snippet'

export async function getStaticPaths({ locales, defaultLocale }) {
  const localesPost = locales
    .map((locale) => {
      const otherLocale = locale !== defaultLocale ? locale : ''
      const posts = getFiles('snippets', otherLocale)
      return posts.map((post) => [post, locale])
    })
    .flat()

  return {
    paths: localesPost.map(([p, l]) => ({
      params: {
        slug: formatSlug(p).split('/'),
      },
      locale: l,
    })),
    fallback: false,
  }
}

export async function getStaticProps({ defaultLocale, locales, locale, params }) {
  const otherLocale = locale !== defaultLocale ? locale : ''
  const allPosts = await getAllFilesFrontMatter('snippets', otherLocale)
  const postIndex = allPosts.findIndex((post) => formatSlug(post.slug) === params.slug.join('/'))
  const prev = allPosts[postIndex + 1] || null
  const next = allPosts[postIndex - 1] || null
  const post = await getFileBySlug('snippets', params.slug.join('/'), otherLocale)
  const authorList = post.frontMatter.authors || ['default']
  const authorPromise = authorList.map(async (author) => {
    const authorResults = await getFileBySlug('authors', [author], otherLocale)
    return authorResults.frontMatter
  })
  const authorDetails = await Promise.all(authorPromise)

  // rss
  if (allPosts.length > 0) {
    const rss = generateRss(allPosts, locale, defaultLocale)
    fs.writeFileSync(`./public/feed${otherLocale === '' ? '' : `.${otherLocale}`}.xml`, rss)
  }

  // Checking if available in other locale for SEO
  const availableLocales = []
  await locales.forEach(async (ilocal) => {
    const otherLocale = ilocal !== defaultLocale ? ilocal : ''
    const iAllPosts = await getAllFilesFrontMatter('snippets', otherLocale)
    iAllPosts.map((ipost) => {
      if (ipost.slug === post.frontMatter.slug && ipost.slug !== '') availableLocales.push(ilocal)
    })
  })

  return { props: { post, authorDetails, prev, next, availableLocales } }
}

export default function Snippet({ post, authorDetails, prev, next, availableLocales }) {
  const { t } = useTranslation()
  const { mdxSource, toc, frontMatter } = post
  return (
    <>
      {frontMatter.draft !== true ? (
        <MDXLayoutRenderer
          layout={frontMatter.layout || DEFAULT_LAYOUT}
          toc={toc}
          mdxSource={mdxSource}
          frontMatter={frontMatter}
          authorDetails={authorDetails}
          prev={prev}
          next={next}
          availableLocales={availableLocales}
        />
      ) : (
        <div className="mt-24 text-center">
          <PageTitle>
            {t('common:construction')}&nbsp;
            <span role="img" aria-label="roadwork sign">
              🚧
            </span>
          </PageTitle>
        </div>
      )}
    </>
  )
}