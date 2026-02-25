

class APIFilters {
  
  
    constructor(query, queryString) {
    this.query = query;
    this.queryStr = queryString;
  }

  search() {
    const keyword = this.queryStr.keyword ? {
        name: {
            $regex: this.queryStr.keyword,
            $options: 'i', // case-insensitive search
        },
    } : {};
    this.query = this.query.find({ ...keyword });
    return this;

    }

    //function to filter products based on query parameters
    filter() {
       const queryCopy = { ...this.queryStr };
       console.log(queryCopy);

    // Fields to remove
    const fieldsToRemove = ["keyword", "page"];
    fieldsToRemove.forEach((el) => delete queryCopy[el]);

    // Advance filter for price, ratings etc
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    console.log(queryStr);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;

  }

  // Pagination method to be implemented
  pagination(resPerPage) {

    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    this.query = this.query.limit(resPerPage).skip(skip);
    return this;

  }

}


export default APIFilters;
// This class is used to filter API requests based on query parameters.
// It supports searching, sorting, field limiting, and pagination.