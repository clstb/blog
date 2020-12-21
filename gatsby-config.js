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
  ],
};
