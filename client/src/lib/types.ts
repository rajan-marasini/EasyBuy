export interface Category {
    id?: string;
    name: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    is_active: boolean;
    brand: string;
    category_id: string;
    category: Category;
    created_at: string;
    updated_at: string;
}

export interface PaginationMeta {
    current_page: number;
    limit: number;
    total_items: number;
    total_pages: number;
}

export interface PaginatedProductsResponse {
    meta: PaginationMeta;
    data: Product[];
}
