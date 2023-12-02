const Chance = require('chance');
const chanceInstance = new Chance();

const generateBlogPost = () => {
  return {
    title: chanceInstance.word({ length: 7 }),
    content: chanceInstance.paragraph({ sentences: 3 }),
    creationDate: chanceInstance.birthday({
      string: true,
      year: chanceInstance.year({ min: 2010, max: 2023 }),
    }),
    likes: chanceInstance.integer({ min: 0, max: 99999 }),
  };
};

const generateComment = () => {
  return {
    content: chanceInstance.paragraph({ sentences: 2 }),
    creationDate: chanceInstance.birthday({
      string: true,
      year: chanceInstance.year({ min: 2010, max: 2023 }),
    }),
  };
};

const generateCategory = () => {
  return {
    name: chanceInstance.word({ length: 7 }),
  };
};

module.exports = { generateBlogPost, generateCategory, generateComment };
