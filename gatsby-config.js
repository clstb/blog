module.exports = {
  siteMetadata: {
    title: `clstBlog`,
    name: `clstb.codes`,
    siteUrl: `https://clstb.codes`,
    description: `Blog of Claas Störtenbecker.`,
    hero: {
      heading: `Stay Awhile and L̷i̷s̷t̷e̷n̷ Read`,
      maxWidth: 652,
    },
    social: [
      {
        name: `github`,
        url: `https://github.com/clstb`,
      },
      {
        name: `linkedin`,
        url: `https://linkedin.com/in/clstb`,
      },
      {
	name: `mailto`,
	url: `mailto:contact@clstb.codes`
      }
    ],
  },
  plugins: [
    {
      resolve: "@narative/gatsby-theme-novela",
      options: {
        contentPosts: "content/posts",
        contentAuthors: "content/authors",
        basePath: "/",
        authorsPage: true,
        mailchimp: true,
        sources: {
          local: true,
        },
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Novela by Narative`,
        short_name: `Novela`,
        start_url: `/`,
        background_color: `#fff`,
        theme_color: `#fff`,
        display: `standalone`,
        icon: `src/assets/favicon.svg`,
      },
    },
    {
      resolve: 'gatsby-plugin-mailchimp',
      options: {
        endpoint: 'https://codes.us7.list-manage.com/subscribe/post?u=6ef422aa6d718533dece62c72&amp;id=027b314468',
      },
    },
    {
      resolve: 'gatsby-plugin-sitemap'
    },
    {
      resolve: 'gatsby-plugin-robots-txt'
    }
  ],
};
