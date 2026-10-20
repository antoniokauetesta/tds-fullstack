// Gerenciamento de CLIENTES
import CrudPage from '../components/CrudPage.jsx';

const colunas = [
  { key: 'nome', label: 'Nome' }, { key: 'cpf', label: 'CPF' },
  { key: 'telefone', label: 'Telefone' }, { key: 'email', label: 'E-mail' },
];
const campos = [
  { name: 'nome', label: 'Nome', required: true },
  { name: 'cpf', label: 'CPF', required: true },
  { name: 'telefone', label: 'Telefone' },
  { name: 'email', label: 'E-mail', type: 'email' },
  { name: 'endereco', label: 'Endereço' },
];

export default function Clientes() {
  return <CrudPage titulo="Clientes" endpoint="/clientes" colunas={colunas} campos={campos} />;
}
