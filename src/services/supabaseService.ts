import supabase from './../supabase-client';

export const fetchCandidates = async () => {
  const { data, error } = await supabase.from('candidates').select(`
        id, 
        users(first_name, last_name, dni, sede),
        groups(id, name),
        positions(id, name)
      `);
  if (error) {
    throw error;
  }
  return data;
};

export const getTypeVoting = async () => {
  const { data, error } = await supabase.from('type_voting').select(`*`);

  if (error) {
    throw error;
  }
  return data;
};
// supabaseService.js
export const deleteVoteForCandidate = async (voteId) => {
  const { error } = await supabase
    .from('votes') // o el nombre de tu tabla de votos
    .delete()
    .eq('id', voteId);

  if (error) {
    throw error;
  }
  return true;
};
export const createUsers = async ({
  first_name,
  last_name,
  dni,
  sede,
}: {
  first_name: string;
  last_name: string;
  dni: string;
  sede: string;
}) => {
  const { error } = await supabase.from('users').insert([
    {
      first_name: first_name.trim().toLowerCase(),
      last_name: last_name.trim().toLowerCase(),
      dni: dni.trim().toLowerCase(),
      sede: sede.trim().toLowerCase(),
    },
  ]);
  if (error) {
    throw error;
  }
  return true;
};
export const createDepartament = async ({ name }: { name: string }) => {
  const { error } = await supabase.from('groups').insert([
    {
      name: name.trim().toLowerCase(),
    },
  ]);
  if (error) {
    throw error;
  }
  return true;
};

export const createPosition = async ({ name }: { name: string }) => {
  const { error } = await supabase.from('positions').insert([
    {
      name: name.trim().toLowerCase(),
    },
  ]);
  if (error) {
    throw error;
  }
  return true;
};
export const voteForCandidate = async ({ voter_id, group_id, candidate_id, position_id }) => {
  const { error } = await supabase
    .from('votes')
    .insert([{ voter_id, group_id, candidate_id, position_id }]);
  if (error) {
    throw error;
  }
  return true;
};

export const getConfigurations = async () => {
  const { data, error } = await supabase.from('configuration').select(`*`);

  if (error) {
    throw error;
  }
  return data;
};

export const getGroups = async () => {
  const { data, error } = await supabase.from('groups').select(`*`);
  if (error) throw error;
  return data;
};
export const getPositions = async () => {
  const { data, error } = await supabase.from('positions').select(`*`);
  if (error) throw error;
  return data;
};
export const createCandidates = async (newCandidates) => {
  const { data, error } = await supabase.from('candidates').upsert(newCandidates);
  if (error) throw error;
  return data;
};

export const getUsers = async () => {
  const { data, error } = await supabase.from('users').select(`*`);

  if (error) {
    throw error;
  }
  return data;
};
export const getDepartaments = async () => {
  const { data, error } = await supabase.from('groups').select(`*`);

  if (error) {
    throw error;
  }
  return data;
};

export const createConfigurationMaxVotes = async (datosToSend) => {
  const { error } = await supabase.from('configuration').upsert(datosToSend, {
    onConflict: ['position_id', 'group_id'],
  });
  if (error) {
    throw error;
  }
  return true;
};
export const getVoteForUser = async (userId) => {
  const { data, error } = await supabase.from('votes').select(`*`).eq('voter_id', userId);

  if (error) {
    throw error;
  }
  return data;
};
// Función para obtener los conteos de votos llamando a la función RPC
export const fetchVoteCounts = async () => {
  const { data, error } = await supabase.rpc('get_vote_counts_details');
  console.log('Conteos de votos:', data); // Agregado para depuración
  if (error) {
    throw error;
  }
  return data;
};

// Función para suscribirse a cambios en la tabla votes
export const subscribeToVotes = (callback) => {
  const subscription = supabase
    .channel('votes-channel')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes' }, (payload) => {
      callback(payload);
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'votes' }, (payload) => {
      callback(payload);
    })
    .subscribe();
  return subscription;
};

// Función para remover la suscripción
export const removeSubscription = (subscription) => {
  supabase.removeChannel(subscription);
};
