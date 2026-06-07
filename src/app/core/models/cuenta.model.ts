export interface Cuenta {
  id:        string;
  nombre:    string;
  icono:     string;
  color:     string;
  creadoEn:  number;
}

export const CUENTA_DEFAULT: Cuenta = {
  id:       'principal',
  nombre:   'Principal',
  icono:    'wallet-outline',
  color:    '#4F6EF7',
  creadoEn: Date.now(),
};

export const ICONOS_CUENTA = [
  { nombre: 'wallet-outline',         label: 'Billetera' },
  { nombre: 'card-outline',           label: 'Tarjeta'   },
  { nombre: 'cash-outline',           label: 'Efectivo'  },
  { nombre: 'business-outline',       label: 'Banco'     },
  { nombre: 'phone-portrait-outline', label: 'Digital'   },
  { nombre: 'briefcase-outline',      label: 'Trabajo'   },
  { nombre: 'home-outline',           label: 'Casa'      },
  { nombre: 'car-outline',            label: 'Auto'      },
];

export const COLORES_CUENTA = [
  '#4F6EF7', '#2dd36f', '#eb445a', '#ffc409',
  '#9b59b6', '#e67e22', '#1abc9c', '#e74c3c',
];
