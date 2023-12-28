const Chance = require("chance");
const chanceInstance = new Chance();

const generateBlogPost = () => {
  return {
    title: chanceInstance.word({ length: 7 }),
    content: chanceInstance.paragraph({ sentences: 3 }),
    creationDate: chanceInstance.birthday({
      string: true,
      year: chanceInstance.year({ min: 2010, max: 2023 }),
    }),
  };
};

const generateCategory = () => {
  return {
    category: chanceInstance.word({ length: 7 }),
  };
};

module.exports = { generateBlogPost, generateCategory };
