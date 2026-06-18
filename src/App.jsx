import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
  createTheme,
} from '@mui/material'
import {
  Add,
  BarChart,
  Business,
  Delete,
  Login,
  Logout,
  Mail,
  Person,
  Refresh,
  Save,
} from '@mui/icons-material'
import {
  createContact,
  createInteraction,
  createOpportunity,
  deleteContact,
  deleteInteraction,
  deleteOpportunity,
  getDashboard,
  getProfile,
  listContacts,
  listInteractions,
  listOpportunities,
  signIn,
  signUp,
  updateContact,
  updateOpportunity,
} from './services/api'
import './App.css'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#5dd6d1' },
    secondary: { main: '#f59e0b' },
    background: { default: '#0b1220', paper: '#111827' },
    text: { primary: '#e5e7eb', secondary: '#9ca3af' },
    divider: '#243041',
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: ['Inter', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'].join(','),
    h4: { fontWeight: 700, letterSpacing: 0 },
    h6: { fontWeight: 700, letterSpacing: 0 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0b1220',
          color: '#e5e7eb',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#111827',
          borderBottom: '1px solid #243041',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 40,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #243041',
          boxShadow: 'none',
          backgroundImage: 'none',
          backgroundColor: '#111827',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          color: '#e5e7eb',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#243041',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#94a3b8',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#0f172a',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#334155',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#5dd6d1',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#5dd6d1',
          },
        },
        input: {
          color: '#e5e7eb',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#111827',
          borderColor: '#243041',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#cbd5e1',
          '&.Mui-selected': {
            color: '#5dd6d1',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#5dd6d1',
        },
      },
    },
  },
})

const initialContactForm = {
  id: '',
  name: '',
  email: '',
  phone: '',
  company: '',
  status: 'lead',
  tag: 'customer',
}

const initialOpportunityForm = {
  id: '',
  title: '',
  description: '',
  pipelineStage: 'proposal',
  estimatedValue: '',
  status: 'open',
  contactId: '',
}

const initialInteractionForm = {
  type: 'email',
  description: '',
  occurredAt: '',
}

const contactStatusLabels = {
  lead: 'Lead',
  active: 'Ativo',
  inactive: 'Inativo',
}

const opportunityStatusLabels = {
  open: 'Aberta',
  won: 'Ganha',
  lost: 'Perdida',
}

const interactionTypeLabels = {
  call: 'Ligação',
  email: 'E-mail',
  meeting: 'Reunião',
  note: 'Observação',
}

const opportunityStageLabels = {
  proposal: 'Proposta',
  qualification: 'Qualificação',
  negotiation: 'Negociação',
  closing: 'Fechamento',
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('crm_token') || '')
  const [authMode, setAuthMode] = useState('sign-in')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [dashboard, setDashboard] = useState(null)
  const [contacts, setContacts] = useState([])
  const [contactSearch, setContactSearch] = useState('')
  const [contactForm, setContactForm] = useState(initialContactForm)
  const [selectedContactId, setSelectedContactId] = useState('')
  const [interactions, setInteractions] = useState([])
  const [interactionForm, setInteractionForm] = useState(initialInteractionForm)

  const [opportunities, setOpportunities] = useState([])
  const [opportunityForm, setOpportunityForm] = useState(initialOpportunityForm)

  const authHeaders = useMemo(() => ({ token }), [token])

  const runAction = useCallback(async (action, options = {}) => {
    const { onSuccess, successMessage, showSuccess = true } = options
    setLoading(true)
    setError('')
    if (showSuccess) setMessage('')
    try {
      const result = await action()
      if (onSuccess) onSuccess(result)
      if (successMessage) setMessage(successMessage)
      return result
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const loadWorkspace = useCallback(async () => {
    await runAction(
      async () => {
        const [profileData, dashboardData, contactData, opportunityData] = await Promise.all([
          getProfile(authHeaders),
          getDashboard(authHeaders),
          listContacts(authHeaders),
          listOpportunities(authHeaders),
        ])
        return { profileData, dashboardData, contactData, opportunityData }
      },
      {
        onSuccess: ({ profileData, dashboardData, contactData, opportunityData }) => {
          setProfile(profileData)
          setDashboard(dashboardData)
          setContacts(contactData)
          setOpportunities(opportunityData)
          setSelectedContactId((current) => current || contactData[0]?.id || '')
        },
        showSuccess: false,
      },
    )
  }, [authHeaders, runAction])

  const loadContacts = useCallback(async () => {
    await runAction(() => listContacts(authHeaders, contactSearch), {
      onSuccess: setContacts,
      showSuccess: false,
    })
  }, [authHeaders, contactSearch, runAction])

  useEffect(() => {
    if (!token) return
    loadWorkspace()
  }, [loadWorkspace, token])

  useEffect(() => {
    if (!token) return
    loadContacts()
  }, [loadContacts, token])

  useEffect(() => {
    if (!token || !selectedContactId) return
    runAction(() => listInteractions(authHeaders, selectedContactId), {
      onSuccess: setInteractions,
      showSuccess: false,
    })
  }, [authHeaders, runAction, selectedContactId, token])

  async function handleAuth(event) {
    event.preventDefault()
    await runAction(
      async () => {
        if (authMode === 'sign-up') {
          await signUp(authForm)
        }
        const result = await signIn({ email: authForm.email, password: authForm.password })
        const accessToken = result.accessToken || result.token
        if (!accessToken) throw new Error('Token not returned by API')
        return accessToken
      },
      {
        onSuccess: (accessToken) => {
          localStorage.setItem('crm_token', accessToken)
          setToken(accessToken)
          setAuthForm({ name: '', email: '', password: '' })
        },
        successMessage: 'Sessão iniciada',
      },
    )
  }

  function handleLogout() {
    localStorage.removeItem('crm_token')
    setToken('')
    setProfile(null)
    setDashboard(null)
    setContacts([])
    setOpportunities([])
    setInteractions([])
  }

  async function handleSaveContact(event) {
    event.preventDefault()
    const payload = {
      name: contactForm.name,
      email: contactForm.email,
      phone: contactForm.phone,
      company: contactForm.company || undefined,
      status: contactForm.status,
      tag: contactForm.tag,
    }

    await runAction(
      async () =>
        contactForm.id
          ? updateContact(authHeaders, contactForm.id, payload)
          : createContact(authHeaders, payload),
      {
        onSuccess: async () => {
          setContactForm(initialContactForm)
          await loadWorkspace()
        },
        successMessage: contactForm.id ? 'Contato atualizado' : 'Contato criado',
      },
    )
  }

  async function handleDeleteContact(contactId) {
    await runAction(() => deleteContact(authHeaders, contactId), {
      onSuccess: async () => {
        if (selectedContactId === contactId) setSelectedContactId('')
        await loadWorkspace()
      },
      successMessage: 'Contato removido',
    })
  }

  async function handleCreateInteraction(event) {
    event.preventDefault()
    if (!selectedContactId) return
    await runAction(
      () =>
        createInteraction(authHeaders, selectedContactId, {
          type: interactionForm.type,
          description: interactionForm.description,
          occurredAt: interactionForm.occurredAt || undefined,
        }),
      {
        onSuccess: async () => {
          setInteractionForm(initialInteractionForm)
          setInteractions(await listInteractions(authHeaders, selectedContactId))
        },
        successMessage: 'Interação registrada',
      },
    )
  }

  async function handleDeleteInteraction(interactionId) {
    await runAction(() => deleteInteraction(authHeaders, interactionId), {
      onSuccess: async () => setInteractions(await listInteractions(authHeaders, selectedContactId)),
      successMessage: 'Interação removida',
    })
  }

  async function handleSaveOpportunity(event) {
    event.preventDefault()
    const payload = {
      title: opportunityForm.title,
      description: opportunityForm.description || undefined,
      pipelineStage: opportunityForm.pipelineStage,
      estimatedValue: Number(opportunityForm.estimatedValue),
      status: opportunityForm.status,
      contactId: opportunityForm.contactId,
    }

    await runAction(
      async () =>
        opportunityForm.id
          ? updateOpportunity(authHeaders, opportunityForm.id, payload)
          : createOpportunity(authHeaders, payload),
      {
        onSuccess: async () => {
          setOpportunityForm(initialOpportunityForm)
          await loadWorkspace()
        },
        successMessage: opportunityForm.id ? 'Oportunidade atualizada' : 'Oportunidade criada',
      },
    )
  }

  async function handleDeleteOpportunity(opportunityId) {
    await runAction(() => deleteOpportunity(authHeaders, opportunityId), {
      onSuccess: loadWorkspace,
      successMessage: 'Oportunidade removida',
    })
  }

  if (!token) {
    return (
      <ThemeProvider theme={theme}>
        <Box className="authShell">
          <Paper className="authPanel">
            <Stack spacing={3}>
              <Stack spacing={1}>
                <Typography variant="h4">CRM de Contatos</Typography>
              </Stack>
              <Tabs value={authMode} onChange={(_, value) => setAuthMode(value)}>
                <Tab value="sign-in" label="Entrar" />
                <Tab value="sign-up" label="Criar conta" />
              </Tabs>
              <Box component="form" onSubmit={handleAuth}>
                <Stack spacing={2}>
                  {authMode === 'sign-up' && (
                    <TextField
                      label="Nome"
                      value={authForm.name}
                      onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                      required
                    />
                  )}
                  <TextField
                    label="E-mail"
                    type="email"
                    value={authForm.email}
                    onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                    required
                  />
                  <TextField
                    label="Senha"
                    type="password"
                    value={authForm.password}
                    onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                    required
                  />
                  {error && <Alert severity="error">{error}</Alert>}
                  <Button type="submit" variant="contained" startIcon={<Login />} disabled={loading}>
                    {authMode === 'sign-up' ? 'Criar conta' : 'Entrar'}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <Box className="appShell">
        <AppBar position="sticky" color="inherit" elevation={0} className="topBar">
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1, color: '#ffffff' }}>
              <Business sx={{ color: '#5dd6d1' }} />
              <Typography variant="h6" sx={{ color: '#ffffff' }}>
                CRM de Contatos
              </Typography>
              {profile && <Chip size="small" icon={<Person />} label={profile.name} />}
            </Box>
            <Tooltip title="Atualizar dados">
              <Box component="span">
                <IconButton onClick={loadWorkspace} disabled={loading}>
                  <Refresh />
                </IconButton>
              </Box>
            </Tooltip>
            <Tooltip title="Encerrar sessão">
              <IconButton onClick={handleLogout}>
                <Logout />
              </IconButton>
            </Tooltip>
          </Toolbar>
          {loading && <LinearProgress />}
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Stack spacing={3}>
            {(message || error) && (
              <Alert severity={error ? 'error' : 'success'} onClose={() => (error ? setError('') : setMessage(''))}>
                {error || message}
              </Alert>
            )}

            <Paper className="navTabs">
              <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} variant="scrollable">
                <Tab value="dashboard" label="Painel" icon={<BarChart />} iconPosition="start" />
                <Tab value="contacts" label="Contatos" icon={<Person />} iconPosition="start" />
                <Tab value="opportunities" label="Oportunidades" icon={<Business />} iconPosition="start" />
              </Tabs>
            </Paper>

            {activeTab === 'dashboard' && <DashboardView dashboard={dashboard} opportunities={opportunities} />}

            {activeTab === 'contacts' && (
              <ContactsView
                contacts={contacts}
                contactForm={contactForm}
                contactSearch={contactSearch}
                interactions={interactions}
                interactionForm={interactionForm}
                selectedContactId={selectedContactId}
                setContactForm={setContactForm}
                setContactSearch={setContactSearch}
                setInteractionForm={setInteractionForm}
                setSelectedContactId={setSelectedContactId}
                onDeleteContact={handleDeleteContact}
                onDeleteInteraction={handleDeleteInteraction}
                onSaveContact={handleSaveContact}
                onSaveInteraction={handleCreateInteraction}
              />
            )}

            {activeTab === 'opportunities' && (
              <OpportunitiesView
                contacts={contacts}
                opportunities={opportunities}
                opportunityForm={opportunityForm}
                setOpportunityForm={setOpportunityForm}
                onDeleteOpportunity={handleDeleteOpportunity}
                onSaveOpportunity={handleSaveOpportunity}
              />
            )}
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

function DashboardView({ dashboard, opportunities }) {
  const cards = [
    ['Contatos', dashboard?.totalContacts ?? 0],
    ['Oportunidades', dashboard?.totalOpportunities ?? 0],
    ['Ganhas', dashboard?.wonOpportunities ?? 0],
    ['Perdidas', dashboard?.lostOpportunities ?? 0],
    ['Valor estimado', formatCurrency(dashboard?.totalEstimatedValue ?? 0)],
    ['Valor ganho', formatCurrency(dashboard?.totalWonValue ?? 0)],
  ]

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box className="cardsGrid">
        {cards.map(([label, value]) => (
          <Card key={label}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                {label}
              </Typography>
              <Typography variant="h4">{value}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Paper className="sectionPanel">
        <Typography variant="h6">Funil de vendas</Typography>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1}>
          {opportunities.slice(0, 6).map((opportunity) => (
            <Stack className="rowItem" direction="row" key={opportunity.id}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography fontWeight={700}>{opportunity.title}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {opportunity.contact?.name} - Etapa: {formatStageLabel(opportunity.pipelineStage)}
                </Typography>
              </Box>
              <Chip label={opportunityStatusLabels[opportunity.status] || opportunity.status} size="small" />
              <Typography className="rowValue">{formatCurrency(opportunity.estimatedValue)}</Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Box>
  )
}

function ContactsView(props) {
  const {
    contacts,
    contactForm,
    contactSearch,
    interactions,
    interactionForm,
    selectedContactId,
    setContactForm,
    setContactSearch,
    setInteractionForm,
    setSelectedContactId,
    onDeleteContact,
    onDeleteInteraction,
    onSaveContact,
    onSaveInteraction,
  } = props

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box className="splitGrid">
        <Paper className="sectionPanel">
          <Typography variant="h6">{contactForm.id ? 'Editar contato' : 'Novo contato'}</Typography>
          <Box component="form" onSubmit={onSaveContact} className="formGrid">
            <TextField label="Nome" value={contactForm.name} onChange={(event) => setContactForm({ ...contactForm, name: event.target.value })} required />
            <TextField label="E-mail" type="email" value={contactForm.email} onChange={(event) => setContactForm({ ...contactForm, email: event.target.value })} required />
            <TextField label="Telefone" value={contactForm.phone} onChange={(event) => setContactForm({ ...contactForm, phone: event.target.value })} required />
            <TextField label="Empresa" value={contactForm.company} onChange={(event) => setContactForm({ ...contactForm, company: event.target.value })} />
            <TextField select label="Status" value={contactForm.status} onChange={(event) => setContactForm({ ...contactForm, status: event.target.value })}>
              <MenuItem value="lead">Lead</MenuItem>
              <MenuItem value="active">Ativo</MenuItem>
              <MenuItem value="inactive">Inativo</MenuItem>
            </TextField>
            <TextField label="Etiqueta" value={contactForm.tag} onChange={(event) => setContactForm({ ...contactForm, tag: event.target.value })} required />
            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained" startIcon={<Save />}>
                Salvar
              </Button>
              <Button onClick={() => setContactForm(initialContactForm)}>Limpar</Button>
            </Stack>
          </Box>
        </Paper>
        <Paper className="sectionPanel">
          <TextField fullWidth label="Buscar" value={contactSearch} onChange={(event) => setContactSearch(event.target.value)} />
          <Stack spacing={1.2} sx={{ mt: 2 }}>
            {contacts.map((contact) => (
              <Stack className="rowItem" direction="row" key={contact.id}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography fontWeight={700}>{contact.name}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {contact.email} - {contact.company || contact.tag}
                  </Typography>
                </Box>
                <Chip size="small" label={contactStatusLabels[contact.status] || contact.status} />
                <Button size="small" onClick={() => setSelectedContactId(contact.id)}>
                  Interações
                </Button>
                <Button size="small" onClick={() => setContactForm({ ...initialContactForm, ...contact })}>
                  Editar
                </Button>
                <Tooltip title="Remover">
                  <IconButton color="error" onClick={() => onDeleteContact(contact.id)}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Box>
      <Paper className="sectionPanel">
        <Typography variant="h6">Interações</Typography>
        <Box component="form" onSubmit={onSaveInteraction} className="interactionGrid">
          <TextField select label="Contato" value={selectedContactId} onChange={(event) => setSelectedContactId(event.target.value)} required>
            {contacts.map((contact) => (
              <MenuItem value={contact.id} key={contact.id}>
                {contact.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Tipo" value={interactionForm.type} onChange={(event) => setInteractionForm({ ...interactionForm, type: event.target.value })}>
            <MenuItem value="call">Ligação</MenuItem>
            <MenuItem value="email">E-mail</MenuItem>
            <MenuItem value="meeting">Reunião</MenuItem>
            <MenuItem value="note">Observação</MenuItem>
          </TextField>
          <TextField type="datetime-local" label="Data" value={interactionForm.occurredAt} onChange={(event) => setInteractionForm({ ...interactionForm, occurredAt: event.target.value })} />
          <TextField label="Descrição" value={interactionForm.description} onChange={(event) => setInteractionForm({ ...interactionForm, description: event.target.value })} required />
          <Button type="submit" variant="contained" startIcon={<Add />}>
            Registrar
          </Button>
        </Box>
        <Stack spacing={1.2} sx={{ mt: 2 }}>
          {interactions.map((interaction) => (
            <Stack className="rowItem" direction="row" key={interaction.id}>
              <Mail color="primary" />
              <Box sx={{ flexGrow: 1 }}>
                <Typography fontWeight={700}>{interactionTypeLabels[interaction.type] || interaction.type}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {interaction.description}
                </Typography>
              </Box>
              <Typography color="text.secondary" variant="body2">
                {formatDate(interaction.occurredAt)}
              </Typography>
              <IconButton color="error" onClick={() => onDeleteInteraction(interaction.id)}>
                <Delete />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Box>
  )
}

function OpportunitiesView({ contacts, opportunities, opportunityForm, setOpportunityForm, onDeleteOpportunity, onSaveOpportunity }) {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box className="splitGrid">
        <Paper className="sectionPanel">
          <Typography variant="h6">{opportunityForm.id ? 'Editar oportunidade' : 'Nova oportunidade'}</Typography>
          <Box component="form" onSubmit={onSaveOpportunity} className="formGrid">
            <TextField label="Título" value={opportunityForm.title} onChange={(event) => setOpportunityForm({ ...opportunityForm, title: event.target.value })} required />
            <TextField select label="Contato" value={opportunityForm.contactId} onChange={(event) => setOpportunityForm({ ...opportunityForm, contactId: event.target.value })} required>
              {contacts.map((contact) => (
                <MenuItem value={contact.id} key={contact.id}>
                  {contact.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Etapa do funil" value={opportunityForm.pipelineStage} onChange={(event) => setOpportunityForm({ ...opportunityForm, pipelineStage: event.target.value })} required />
            <TextField label="Valor" type="number" value={opportunityForm.estimatedValue} onChange={(event) => setOpportunityForm({ ...opportunityForm, estimatedValue: event.target.value })} required />
            <TextField select label="Status" value={opportunityForm.status} onChange={(event) => setOpportunityForm({ ...opportunityForm, status: event.target.value })}>
              <MenuItem value="open">Aberta</MenuItem>
              <MenuItem value="won">Ganha</MenuItem>
              <MenuItem value="lost">Perdida</MenuItem>
            </TextField>
            <TextField label="Descrição" multiline minRows={3} value={opportunityForm.description} onChange={(event) => setOpportunityForm({ ...opportunityForm, description: event.target.value })} />
            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained" startIcon={<Save />}>
                Salvar
              </Button>
              <Button onClick={() => setOpportunityForm(initialOpportunityForm)}>Limpar</Button>
            </Stack>
          </Box>
        </Paper>
        <Paper className="sectionPanel">
          <Stack spacing={1.2}>
            {opportunities.map((opportunity) => (
              <Stack className="rowItem" direction="row" key={opportunity.id}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography fontWeight={700}>{opportunity.title}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {opportunity.contact?.name} - Etapa: {formatStageLabel(opportunity.pipelineStage)}
                  </Typography>
                </Box>
                <Typography className="rowValue">{formatCurrency(opportunity.estimatedValue)}</Typography>
                <Chip size="small" label={opportunityStatusLabels[opportunity.status] || opportunity.status} />
                <Button size="small" onClick={() => setOpportunityForm({ ...initialOpportunityForm, ...opportunity })}>
                  Editar
                </Button>
                <IconButton color="error" onClick={() => onDeleteOpportunity(opportunity.id)}>
                  <Delete />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Box>
    </Box>
  )
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))
}

function formatStageLabel(value) {
  if (!value) return ''
  return opportunityStageLabels[value] || value.replaceAll('_', ' ')
}

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

export default App
