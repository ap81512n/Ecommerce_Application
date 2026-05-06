import re


class APIFilters:
    """Chainable query builder mirroring the Node.js APIFilters class.

    Builds a MongoDB filter dict and pagination params from URL query
    parameters, then applies them to a Beanie find() call.

    Usage:
        api = APIFilters(query_params)
        api.search().filter()
        products = await Product.find(api.query).skip(api.skip).limit(api.limit).to_list()
    """

    REMOVED_FIELDS = {"keyword", "page"}

    def __init__(self, query_params: dict):
        self.query_params = dict(query_params)
        self.query: dict = {}
        self.skip: int = 0
        self.limit: int = 8

    def search(self) -> "APIFilters":
        """Filter by keyword in product name (case-insensitive regex)."""
        keyword = self.query_params.get("keyword")
        if keyword:
            self.query["name"] = {"$regex": re.escape(keyword), "$options": "i"}
        return self

    def filter(self) -> "APIFilters":
        """Apply numeric range and equality filters from query params.

        Converts URL operators (gte, gt, lte, lt) to MongoDB operators.
        """
        params = {k: v for k, v in self.query_params.items() if k not in self.REMOVED_FIELDS}

        # Convert bracket notation: price[gte] -> price.$gte
        mongo_filter: dict = {}
        for key, value in params.items():
            # Match keys like price[gte], ratings[lte], etc.
            match = re.match(r"^(\w+)\[(gte|gt|lte|lt)\]$", key)
            if match:
                field, op = match.groups()
                mongo_filter.setdefault(field, {})[f"${op}"] = float(value)
            else:
                mongo_filter[key] = value

        self.query.update(mongo_filter)
        return self

    def pagination(self, res_per_page: int) -> "APIFilters":
        """Calculate skip/limit for the requested page number."""
        self.limit = res_per_page
        page = int(self.query_params.get("page", 1))
        self.skip = res_per_page * (page - 1)
        return self
