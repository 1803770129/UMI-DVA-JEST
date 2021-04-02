export const getCreateParams = checkedCategoryList => {
    const categories = [];
    for (const ccl of checkedCategoryList) {
        const parts = [];
        for (const part of ccl.parts) {
            parts.push({
                category_id: part.category_id,
                brand_category_id: part.brand_category_id
            });
        }
        categories.push({
            brand_category_id: ccl.brand_category_id,
            parts
        });
    }
    return categories;
};

export const categoriesPartsList = data => {
    const categoryList = [];
    for (const [index, d] of data.entries()) {
        const { parts: partsList = [] } = d;
        const content = [];
        const parts = [];
        for (const pl of partsList) {
            content.push(pl.category_name);
            parts.push({
                category_id: pl.category_id,
                brand_category_id: pl.brand_category_id
            });
        }

        categoryList.push({
            id: index,
            name: d.brand_category_name,
            brand_category_id: d.brand_category_id,
            content: content.join('，'),
            checked: d.checked,
            disable: d.disable,
            parts
        });
    }
    return categoryList;
};
