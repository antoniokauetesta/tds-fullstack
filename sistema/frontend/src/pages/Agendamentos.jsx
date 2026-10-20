// Gerenciamento de AGENDAMENTOS DE SERVIÇOS
import CrudPage from '../components/CrudPage.jsx';

const STATUS = ['Agendado', 'Em andamento', 'Concluído', 'Cancelado'];

const colunas = [
  { key: 'data_hora', label: 'Data/Hora', render: (r) => r.data_hora.slice(0, 16).replace('T', ' ') },
  { key: 'placa', label: 'Placa' }, { key: 'cliente', label: 'Cliente' },
  { key: 'servico', label: 'Serviço' }, { key: 'status', label: 'Status' },
];
const campos = [
  { name: 'veiculo_id', label: 'Veículo', type: 'select', required: true,
    optionsFrom: { endpoint: '/veiculos', label: (v) => `${v.placa} - ${v.modelo} (${v.proprietario})` } },
  { name: 'servico_id', label: 'Serviço', type: 'select', required: true,
    optionsFrom: { endpoint: '/servicos', label: (s) => `${s.descricao} - R$ ${Number(s.valor).toFixed(2)}` } },
  { name: 'data_hora', label: 'Data e hora', type: 'datetime-local', required: true },
  { name: 'status', label: 'Status', type: 'select', options: STATUS, required: true },
  { name: 'observacoes', label: 'Observações' },
];
const paraForm = (r) => ({
  veiculo_id: r.veiculo_id, servico_id: r.servico_id, status: r.status,
  data_hora: r.data_hora.slice(0, 16).replace(' ', 'T'), observacoes: r.observacoes ?? '',
});

export default function Agendamentos() {
  return (
    <CrudPage titulo="Agendamentos" endpoint="/agendamentos" colunas={colunas} campos={campos}
      inicial={{ status: 'Agendado' }} paraForm={paraForm} statusOpcoes={STATUS} />
  );
}
