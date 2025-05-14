              // Product Grid
              {!loading && products.length > 0 && (
                <div className={
                  viewMode === 'grid' 
                  ? "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8" 
                  : "space-y-8"
                }>
                  {products.map((product) => (
                    viewMode === 'grid' ? (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onToggleCompare={toggleProductComparison}
                        isSelected={selectedProducts.includes(product.id)}
                        compact={false}
                      />
                    ) : (
                      <div key={product.id} className="flex flex-col sm:flex-row bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 hover:shadow-md transition-shadow duration-200">
                        <div className="sm:w-1/3 relative">
                          <Link to={`/products/${product.id}`}>
                            <img
                              src={getImageUrl(product.image)}
                              alt={product.name}
                              className="w-full h-64 sm:h-full object-cover object-center"
                            />
                          </Link>
                          <button
                            onClick={() => toggleProductComparison(product.id)}
                            className={`absolute top-4 right-4 p-2 rounded-full ${
                              selectedProducts.includes(product.id)
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-primary-50 hover:text-primary-600'
                            }`}
                            title="Compare"
                          >
                            <ArrowsRightLeftIcon className="h-5 w-5" />
                          </button>
                        </div>
                        
                        <div className="sm:w-2/3 p-6 flex flex-col">
                          <h3 className="text-xl font-medium text-gray-900 mb-3">
                            <Link to={`/products/${product.id}`} className="hover:text-primary-600 transition-colors">
                              {product.name}
                            </Link>
                          </h3>
                          <p className="text-gray-600 mb-6 flex-grow">
                            {product.description.substring(0, 200)}
                            {product.description.length > 200 ? '...' : ''}
                          </p>
                          
                          <div className="flex items-center justify-between mt-auto">
                            <div>
                              {product.discount && product.discount > 0 ? (
                                <div className="flex items-center">
                                  <span className="text-xl font-semibold text-red-600">
                                    ${formatPrice(product.price * (1 - Number(product.discount) / 100))}
                                  </span>
                                  <span className="ml-2 text-gray-500 text-sm line-through">
                                    ${formatPrice(product.price)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xl font-semibold text-gray-900">
                                  ${formatPrice(product.price)}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleAddToCart(product.id)}
                              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                            >
                              <ShoppingCartIcon className="h-5 w-5 mr-2" />
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )} 