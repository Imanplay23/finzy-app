import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/inicio',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
      },
      {
        path: 'gastos',
        loadComponent: () => import('./pages/gastos/gastos.page').then(m => m.GastosPage),
      },
      {
        path: 'presupuesto',
        loadComponent: () => import('./pages/presupuesto/presupuesto.page').then(m => m.PresupuestoPage),
      },
      {
        path: 'estadisticas',
        loadComponent: () => import('./pages/estadisticas/estadisticas.page').then(m => m.EstadisticasPage),
      },
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      }
    ]
  },
  {
    path: 'configuracion',
    loadComponent: () => import('./pages/configuracion/configuracion.page').then(m => m.ConfiguracionPage),
  },
];