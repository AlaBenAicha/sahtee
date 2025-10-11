import { useState } from "react";
import { Store, Star, Search, Filter, ShoppingCart, Eye, Heart, Package } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

export function Marketplace() {
  const [activeTab, setActiveTab] = useState('epi');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const epiProducts = [
    {
      id: 1,
      name: "Gants nitrile haute résistance",
      brand: "SafeGuard Pro",
      category: "Gants",
      price: "€45.90",
      rating: 4.8,
      reviews: 124,
      image: "https://images.unsplash.com/photo-1635862532821-88bd99afb5dd?w=300&h=200&fit=crop",
      description: "Gants jetables en nitrile, résistants aux produits chimiques",
      features: ["Sans poudre", "Résistant chimique", "Grippage renforcé"],
      certifications: ["EN 374", "EN 420"],
      neutral: true
    },
    {
      id: 2,
      name: "Masque respiratoire FFP3",
      brand: "ProtectAir",
      category: "Protection respiratoire",
      price: "€12.50",
      rating: 4.6,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=300&h=200&fit=crop",
      description: "Masque de protection contre particules fines et aérosols",
      features: ["Filtration 99%", "Soupape expiratoire", "Élastiques confort"],
      certifications: ["EN 149", "FFP3"],
      neutral: true
    },
    {
      id: 3,
      name: "Chaussures de sécurité S3",
      brand: "WorkSafe",
      category: "Chaussures",
      price: "€89.99",
      rating: 4.5,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1544966503-7cc4ac7b567a?w=300&h=200&fit=crop",
      description: "Chaussures hautes avec coque de protection et semelle anti-perforation",
      features: ["Coque composite", "Anti-perforation", "Imperméable"],
      certifications: ["EN ISO 20345", "S3"],
      neutral: true
    },
    {
      id: 4,
      name: "Lunettes de protection étanches",
      brand: "ClearVision",
      category: "Protection oculaire",
      price: "€28.75",
      rating: 4.7,
      reviews: 67,
      image: "https://images.unsplash.com/photo-1577985051167-0d49aec6c35c?w=300&h=200&fit=crop",
      description: "Lunettes panoramiques avec ventilation indirecte",
      features: ["Anti-buée", "UV400", "Réglables"],
      certifications: ["EN 166"],
      neutral: true
    }
  ];

  const ergonomyProducts = [
    {
      id: 5,
      name: "Support dorsal ergonomique",
      brand: "ErgoSupport",
      category: "Support postural",
      price: "€125.00",
      rating: 4.4,
      reviews: 78,
      image: "https://images.unsplash.com/photo-1611117775350-ac3950990985?w=300&h=200&fit=crop",
      description: "Ceinture de maintien lombaire pour travaux physiques",
      features: ["Ajustable", "Respirant", "Support lombaire"],
      certifications: ["ISO 11228"],
      neutral: true
    },
    {
      id: 6,
      name: "Tapis anti-fatigue",
      brand: "ComfortFloor",
      category: "Aménagement poste",
      price: "€67.50",
      rating: 4.3,
      reviews: 93,
      image: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=300&h=200&fit=crop",
      description: "Tapis ergonomique pour postes de travail debout",
      features: ["Anti-dérapant", "Mousse mémoire", "Facile entretien"],
      certifications: ["EN ISO 24343"],
      neutral: true
    },
    {
      id: 7,
      name: "Aide à la manutention",
      brand: "LiftAssist",
      category: "Manutention",
      price: "€340.00",
      rating: 4.9,
      reviews: 45,
      image: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=300&h=200&fit=crop",
      description: "Système d'assistance pour levage de charges lourdes",
      features: ["Capacité 50kg", "Portable", "Réduction effort 80%"],
      certifications: ["EN 1005"],
      neutral: true
    },
    {
      id: 8,
      name: "Siège ergonomique atelier",
      brand: "WorkSeat Pro",
      category: "Assise",
      price: "€245.90",
      rating: 4.6,
      reviews: 112,
      image: "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=300&h=200&fit=crop",
      description: "Siège réglable pour postes de travail industriels",
      features: ["Hauteur variable", "Support lombaire", "Roulettes tout terrain"],
      certifications: ["EN 1335"],
      neutral: true
    }
  ];

  const categories = [
    { id: 'all', name: 'Tous', count: epiProducts.length + ergonomyProducts.length },
    { id: 'gants', name: 'Gants', count: 1 },
    { id: 'respiratoire', name: 'Protection respiratoire', count: 1 },
    { id: 'chaussures', name: 'Chaussures', count: 1 },
    { id: 'oculaire', name: 'Protection oculaire', count: 1 },
    { id: 'ergonomie', name: 'Ergonomie', count: 4 }
  ];

  const recommendations = [
    {
      id: 1,
      title: "Kit protection laboratoire",
      description: "Ensemble complet pour travail en laboratoire chimique",
      products: ["Gants nitrile", "Lunettes étanches", "Masque FFP3"],
      savings: "15%",
      price: "€78.50"
    },
    {
      id: 2,
      title: "Pack ergonomie bureau",
      description: "Solution complète pour améliorer le confort au bureau",
      products: ["Support dorsal", "Tapis anti-fatigue", "Siège ergonomique"],
      savings: "20%",
      price: "€385.90"
    }
  ];

  const allProducts = [...epiProducts, ...ergonomyProducts];
  const currentProducts = activeTab === 'epi' ? epiProducts : activeTab === 'ergonomy' ? ergonomyProducts : allProducts;

  const ProductCard = ({ product }: { product: any }) => (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <div className="relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          {product.neutral && (
            <Badge className="bg-[var(--sahtee-blue-primary)] text-white">
              Recommandé SAHTEE
            </Badge>
          )}
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-white">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium line-clamp-2">{product.name}</h4>
            <p className="text-sm text-gray-600">{product.brand}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.rating}</span>
            </div>
            <span className="text-xs text-gray-500">({product.reviews} avis)</span>
          </div>
          
          <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
          
          <div className="flex flex-wrap gap-1">
            {product.features.slice(0, 2).map((feature: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="text-lg font-bold text-[var(--sahtee-blue-primary)]">
              {product.price}
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                <Eye className="w-4 h-4" />
              </Button>
              <Button size="sm" className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]">
                <ShoppingCart className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-900">Marketplace SST</h1>
            <p className="text-gray-600">Recommandations neutres d'EPI et solutions ergonomiques</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4" />
              <span>2,856 produits certifiés</span>
            </div>
            <Button variant="outline" size="sm">
              <Heart className="w-4 h-4 mr-2" />
              Favoris (12)
            </Button>
            <Button className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Panier (3)
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r min-h-screen p-4">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border rounded-lg text-sm w-full"
            />
          </div>

          {/* Categories */}
          <div className="space-y-2 mb-6">
            <h3 className="font-medium text-sm text-gray-900 mb-3">Catégories</h3>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full flex items-center justify-between p-2 rounded text-sm transition-colors ${
                  selectedCategory === category.id 
                    ? 'bg-[var(--sahtee-neutral)] text-[var(--sahtee-blue-primary)]' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <span>{category.name}</span>
                <span className="text-xs text-gray-500">({category.count})</span>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-900">Filtres</h3>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Prix</label>
              <div className="space-y-2">
                <label className="flex items-center text-xs">
                  <input type="checkbox" className="mr-2" />
                  Moins de €50
                </label>
                <label className="flex items-center text-xs">
                  <input type="checkbox" className="mr-2" />
                  €50 - €100
                </label>
                <label className="flex items-center text-xs">
                  <input type="checkbox" className="mr-2" />
                  Plus de €100
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Certification</label>
              <div className="space-y-2">
                <label className="flex items-center text-xs">
                  <input type="checkbox" className="mr-2" />
                  EN 374
                </label>
                <label className="flex items-center text-xs">
                  <input type="checkbox" className="mr-2" />
                  EN 166
                </label>
                <label className="flex items-center text-xs">
                  <input type="checkbox" className="mr-2" />
                  ISO 20345
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Navigation Tabs */}
          <div className="bg-white border-b px-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('epi')}
                className={`py-4 px-2 border-b-2 transition-colors ${
                  activeTab === 'epi' 
                    ? 'border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Store className="w-4 h-4 inline-block mr-2" />
                Équipements de Protection
              </button>
              <button
                onClick={() => setActiveTab('ergonomy')}
                className={`py-4 px-2 border-b-2 transition-colors ${
                  activeTab === 'ergonomy' 
                    ? 'border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Package className="w-4 h-4 inline-block mr-2" />
                Solutions Ergonomiques
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`py-4 px-2 border-b-2 transition-colors ${
                  activeTab === 'recommendations' 
                    ? 'border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Star className="w-4 h-4 inline-block mr-2" />
                Recommandations
              </button>
            </div>
          </div>

          <main className="p-6">
            {activeTab === 'recommendations' ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Packs recommandés SAHTEE</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid lg:grid-cols-2 gap-6">
                      {recommendations.map((rec) => (
                        <Card key={rec.id} className="border-[var(--sahtee-blue-primary)] border-2">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold text-lg">{rec.title}</h4>
                                  <p className="text-sm text-gray-600">{rec.description}</p>
                                </div>
                                <Badge className="bg-green-100 text-green-800">
                                  -{rec.savings}
                                </Badge>
                              </div>
                              
                              <div>
                                <h5 className="font-medium text-sm mb-2">Inclus :</h5>
                                <ul className="space-y-1">
                                  {rec.products.map((product, index) => (
                                    <li key={index} className="text-sm text-gray-600">
                                      • {product}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div className="flex items-center justify-between pt-4 border-t">
                                <div className="text-xl font-bold text-[var(--sahtee-blue-primary)]">
                                  {rec.price}
                                </div>
                                <Button className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]">
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  Ajouter le pack
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Results Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {activeTab === 'epi' ? 'Équipements de Protection Individuelle' : 'Solutions Ergonomiques'}
                    </h2>
                    <p className="text-gray-600">{currentProducts.length} produits trouvés</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Trier par :</span>
                    <select className="border rounded px-3 py-1 text-sm">
                      <option>Recommandés</option>
                      <option>Prix croissant</option>
                      <option>Prix décroissant</option>
                      <option>Mieux notés</option>
                    </select>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}