import { useState } from "react";
import { Play, BookOpen, Award, Users, Clock, Star, Search, Filter, Plus, Download } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

export function Training() {
  const [activeTab, setActiveTab] = useState('catalog');

  const courses = [
    {
      id: 1,
      title: "Manipulation Manuelle des Charges",
      description: "Techniques de manutention sécurisée et prévention des TMS",
      category: "Ergonomie",
      duration: "2h 30min",
      level: "Débutant",
      rating: 4.8,
      enrolled: 24,
      completed: 18,
      thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
      modules: 8,
      certifiable: true,
      mandatory: true
    },
    {
      id: 2,
      title: "Sécurité Chimique en Laboratoire",
      description: "Manipulation sécurisée des produits chimiques et équipements de protection",
      category: "Chimique",
      duration: "3h 15min",
      level: "Intermédiaire",
      rating: 4.9,
      enrolled: 12,
      completed: 8,
      thumbnail: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=300&h=200&fit=crop",
      modules: 12,
      certifiable: true,
      mandatory: true
    },
    {
      id: 3,
      title: "Conduite en Sécurité d'Équipements",
      description: "Utilisation sécurisée des machines et équipements industriels",
      category: "Machines",
      duration: "4h 00min",
      level: "Avancé",
      rating: 4.7,
      enrolled: 8,
      completed: 5,
      thumbnail: "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=300&h=200&fit=crop",
      modules: 15,
      certifiable: true,
      mandatory: false
    },
    {
      id: 4,
      title: "Gestion du Stress au Travail",
      description: "Techniques de gestion du stress et prévention des risques psychosociaux",
      category: "Psychosocial",
      duration: "1h 45min",
      level: "Débutant",
      rating: 4.6,
      enrolled: 32,
      completed: 28,
      thumbnail: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=200&fit=crop",
      modules: 6,
      certifiable: false,
      mandatory: false
    }
  ];

  const myTrainings = [
    {
      id: 1,
      courseId: 1,
      progress: 75,
      lastAccessed: "2024-01-20",
      completedModules: 6,
      totalModules: 8,
      status: "En cours",
      certificateEarned: false
    },
    {
      id: 2,
      courseId: 2,
      progress: 100,
      lastAccessed: "2024-01-15",
      completedModules: 12,
      totalModules: 12,
      status: "Terminé",
      certificateEarned: true
    }
  ];

  const certificates = [
    {
      id: 1,
      courseName: "Sécurité Chimique en Laboratoire",
      issuedDate: "2024-01-15",
      expiryDate: "2025-01-15",
      certificateNumber: "SCHT-2024-001",
      status: "Valide"
    },
    {
      id: 2,
      courseName: "Manipulation Manuelle des Charges",
      issuedDate: "2023-06-10",
      expiryDate: "2024-06-10",
      certificateNumber: "MMC-2023-024",
      status: "Expire bientôt"
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Ergonomie': return 'bg-secondary text-primary';
      case 'Chimique': return 'bg-orange-100 text-orange-800';
      case 'Machines': return 'bg-green-100 text-green-800';
      case 'Psychosocial': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Débutant': return 'bg-green-50 text-green-700';
      case 'Intermédiaire': return 'bg-yellow-50 text-yellow-700';
      case 'Avancé': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-900">Formation Continue</h1>
            <p className="text-gray-600">Système de gestion de l'apprentissage (LMS)</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Rapport formations
            </Button>
            <Button className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle formation
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === 'catalog' 
                ? 'border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen className="w-4 h-4 inline-block mr-2" />
            Catalogue
          </button>
          <button
            onClick={() => setActiveTab('mytrainings')}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === 'mytrainings' 
                ? 'border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 inline-block mr-2" />
            Mes formations
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === 'certificates' 
                ? 'border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Award className="w-4 h-4 inline-block mr-2" />
            Certifications
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher une formation..."
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm w-full"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </Button>
            </div>

            {/* Courses Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg">{course.title}</h3>
                          {course.mandatory && (
                            <Badge className="bg-red-100 text-red-800">Obligatoire</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">{course.description}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getCategoryColor(course.category)}>
                          {course.category}
                        </Badge>
                        <Badge variant="outline" className={getLevelColor(course.level)}>
                          {course.level}
                        </Badge>
                        {course.certifiable && (
                          <Badge variant="outline" className="border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]">
                            <Award className="w-3 h-3 mr-1" />
                            Certifiant
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span>{course.modules} modules</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>{course.rating} / 5</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{course.enrolled} inscrits</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Play className="w-4 h-4 mr-2" />
                          Aperçu
                        </Button>
                        <Button size="sm" className="flex-1 bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]">
                          S'inscrire
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'mytrainings' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Formations en cours</p>
                      <p className="text-3xl font-bold text-[var(--sahtee-blue-primary)]">1</p>
                    </div>
                    <Clock className="w-8 h-8 text-[var(--sahtee-blue-primary)]" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Formations terminées</p>
                      <p className="text-3xl font-bold text-green-500">1</p>
                    </div>
                    <Award className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Heures de formation</p>
                      <p className="text-3xl font-bold text-[var(--sahtee-blue-secondary)]">5h 45min</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-[var(--sahtee-blue-secondary)]" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4">
              {myTrainings.map((training) => {
                const course = courses.find(c => c.id === training.courseId);
                if (!course) return null;
                
                return (
                  <Card key={training.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{course.title}</h4>
                              <p className="text-sm text-gray-600">{course.category}</p>
                            </div>
                            <Badge className={training.status === 'Terminé' ? 'bg-green-100 text-green-800' : 'bg-secondary text-primary'}>
                              {training.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progression</span>
                              <span>{training.progress}% ({training.completedModules}/{training.totalModules} modules)</span>
                            </div>
                            <Progress value={training.progress} className="h-2" />
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-sm text-gray-500">
                              Dernier accès: {training.lastAccessed}
                            </span>
                            <div className="flex gap-2">
                              {training.certificateEarned && (
                                <Button size="sm" variant="outline">
                                  <Download className="w-4 h-4 mr-2" />
                                  Certificat
                                </Button>
                              )}
                              <Button size="sm" className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]">
                                <Play className="w-4 h-4 mr-2" />
                                {training.status === 'Terminé' ? 'Revoir' : 'Continuer'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mes certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-[var(--sahtee-neutral)] rounded-full p-3">
                          <Award className="w-6 h-6 text-[var(--sahtee-blue-primary)]" />
                        </div>
                        <div>
                          <h4 className="font-medium">{cert.courseName}</h4>
                          <p className="text-sm text-gray-600">N° {cert.certificateNumber}</p>
                          <p className="text-sm text-gray-500">
                            Délivré le {cert.issuedDate} • Expire le {cert.expiryDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cert.status === 'Valide' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                          {cert.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}