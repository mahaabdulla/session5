const buildCourseQuery = ({ search, minPrice, maxPrice }) => {
  const query = {};

  if (search) {
    const escapedSearch = search
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (escapedSearch) {
      query.title = {
        $regex: escapedSearch,
        $options: "i",
      };
    }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};

    if (minPrice !== undefined) {
      query.price.$gte = Number(minPrice);
    }

    if (maxPrice !== undefined) {
      query.price.$lte = Number(maxPrice);
    }
  }

  return query;
};

module.exports = {
  buildCourseQuery,
};