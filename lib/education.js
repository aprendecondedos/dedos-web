module.exports = {
  /**
   * Listado de niveles de educación
   *
   * @returns {{id: number, icon: string, name: string}[]}
   */
  education_levels: function() {
    return [
      {id: 1, icon: '', name: 'infant'},
      {id: 2, icon: '', name: 'primary'},
      {id:3, icon: '', name: 'nee'}
    ];
  },
  /**
   * Listado de asignaturas
   *
   * @returns {{id: number, icon: string, name: string}[]}
   */
  subjects: function() {
    return [
      {id: 1, icon: 'edu-188', name: 'maths'},
      //{icon: 'edu-108', name: 'subject:nat_sciences'},
      {id: 2, icon: 'edu-014', name: 'nat_sciences'},
      {id: 3, icon: 'edu-036', name: 'spanish_language'},
      {id: 4, icon: 'edu-044', name: 'social_sciences'},
      {id: 5, icon: 'edu-107', name: 'english_language'},
      {id: 6, icon: 'edu-052', name: 'con_corp'},
      {id: 7, icon: 'edu-024', name: 'con_med'},
      {id: 8, icon: 'edu-143', name: 'com_len'}
    ];
  }
};
