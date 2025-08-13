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

export const deleteUsers = async (userId) => {
  console.log('Deleting position with ID:', userId);
  const { data, error } = await supabase.from('votes').select(`*`).eq('voter_id', userId);
  if (error) {
    throw error;
  }
  if (data.length > 0) {
    throw new Error('No se puede eliminar el usuario porque tiene votos asociados.');
  }
  const { data: candidatesData, error: deleteError } = await supabase
    .from('candidates')
    .select(`*`)
    .eq('user_id', userId);

  if (deleteError) {
    throw deleteError;
  }
  if (candidatesData.length > 0) {
    throw new Error('No se puede eliminar el usuario porque es un candidato.');
  }

  const { error: deletePositionError } = await supabase.from('users').delete().eq('id', userId);

  if (deletePositionError) {
    throw deletePositionError;
  }
  return true;
};
export const deleteDepartament = async (departamentId) => {
  console.log('Deleting position with ID:', departamentId);
  const { data, error } = await supabase.from('votes').select(`*`).eq('group_id', departamentId);
  if (error) {
    throw error;
  }
  if (data.length > 0) {
    throw new Error('No se puede eliminar la departamento porque tiene votos asociados.');
  }
  const { data: candidatesData, error: deleteError } = await supabase
    .from('candidates')
    .select(`*`)
    .eq('group_id', departamentId);

  if (deleteError) {
    throw deleteError;
  }
  if (candidatesData.length > 0) {
    throw new Error('No se puede eliminar la departamento porque tiene candidatos asociados.');
  }
  const { error: deleteConfigurationError } = await supabase
    .from('configuration')
    .delete()
    .eq('group_id', departamentId);

  if (deleteConfigurationError) {
    throw deleteConfigurationError;
  }

  const { error: deletePositionError } = await supabase
    .from('groups')
    .delete()
    .eq('id', departamentId);

  if (deletePositionError) {
    throw deletePositionError;
  }
  return true;
};
export const deletePositions = async (positionsId) => {
  console.log('Deleting position with ID:', positionsId);
  const { data, error } = await supabase.from('votes').select(`*`).eq('position_id', positionsId);
  if (error) {
    throw error;
  }
  if (data.length > 0) {
    throw new Error('No se puede eliminar la posición porque tiene votos asociados.');
  }
  const { data: candidatesData, error: deleteError } = await supabase
    .from('candidates')
    .select(`*`)
    .eq('position_id', positionsId);

  if (deleteError) {
    throw deleteError;
  }
  if (candidatesData.length > 0) {
    throw new Error('No se puede eliminar la posición porque tiene candidatos asociados.');
  }
  const { error: deleteConfigurationError } = await supabase
    .from('configuration')
    .delete()
    .eq('position_id', positionsId);

  if (deleteConfigurationError) {
    throw deleteConfigurationError;
  }

  const { error: deletePositionError } = await supabase
    .from('positions')
    .delete()
    .eq('id', positionsId);

  if (deletePositionError) {
    throw deletePositionError;
  }
  return true;
};
export const deleteCandidate = async (candidateId) => {
  const { data, error } = await supabase.from('votes').select(`*`).eq('candidate_id', candidateId);
  console.log('Votes for candidate:', data); // Agregado para
  if (error) {
    throw error;
  }
  if (data.length > 0) {
    throw new Error('No se puede eliminar el candidato porque tiene votos asociados.');
  }
  const { error: deleteError } = await supabase.from('candidates').delete().eq('id', candidateId);
  if (deleteError) {
    throw deleteError;
  }
  return true;
};
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
export const updateUserState = async ({ id_user, state }: { id_user: string; state: boolean }) => {
  console.log(id_user, state);
  const { error } = await supabase
    .from('users')
    .update({ state }) // <-- Actualiza solo el campo 'state'
    .eq('id', id_user); // <-- Filtro por 'id_user'

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
  type,
}: {
  first_name: string;
  last_name: string;
  dni: string;
  sede: string;
  type: number;
}) => {
  const { data: dataUser, error: dataError } = await supabase
    .from('users')
    .select(`*`)
    .eq('dni', dni.trim().toLowerCase());

  if (dataError) {
    throw dataError;
  }
  if (dataUser.length > 0) {
    throw new Error('El usuario ya existe.');
  }
  const { error } = await supabase.from('users').insert([
    {
      first_name: first_name.trim().toLowerCase(),
      last_name: last_name.trim().toLowerCase(),
      dni: dni.trim().toLowerCase(),
      sede: sede.trim().toLowerCase(),
      type: type,
    },
  ]);
  if (error) {
    throw error;
  }
  return true;
};
export const createDepartament = async ({ name }: { name: string }) => {
  const { data: dataDepartament, error: dataError } = await supabase
    .from('groups')
    .select(`*`)
    .eq('name', name.trim().toLowerCase());

  if (dataError) {
    throw dataError;
  }
  if (dataDepartament.length > 0) {
    throw new Error('El departamento ya existe.');
  }
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
  const { data: dataPosition, error: dataError } = await supabase
    .from('positions')
    .select(`*`)
    .eq('name', name.trim().toLowerCase());

  if (dataError) {
    throw dataError;
  }
  if (dataPosition.length > 0) {
    throw new Error('El posicion ya existe.');
  }

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
