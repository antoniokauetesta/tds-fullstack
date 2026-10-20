// Gerenciamento de VEÍCULOS
import CrudPage from '../components/CrudPage.jsx';

const colunas = [
  { key: 'placa', label: 'Placa' }, { key: 'marca', label: 'Marca' },
  { key: 'modelo', label: 'Modelo' }, { key: 'ano', label: 'Ano' },
  { key: 'proprietario', label: 'Proprietário' },
];
const campos = [
  { name: 'placa', label: 'Placa (ex.: ABC1D23)', required: true },
  { name: 'marca', label: 'Marca', required: true },
  { name: 'modelo', label: 'Modelo', required: true },
  { name: 'ano', label: 'Ano', type: 'number' },
  { name: 'cor', label: 'Cor' },
  { name: 'cliente_id', label: 'Proprietário', type: 'select', required: true,
    optionsFrom: { endpoint: '/clientes', label: (c) => `${c.nome} (${c.cpf})` } },
];

export default function Veiculos() {
  return <CrudPage titulo="Veículos" endpoint="/veiculos" colunas={colunas} campos={campos} />;
}
