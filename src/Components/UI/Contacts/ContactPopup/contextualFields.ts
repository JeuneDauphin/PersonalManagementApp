import { ContactType } from '../../../../utils/types/types';

export const getContextualFields = (type: ContactType) => {
  switch (type) {
    case 'work':
    case 'client':
    case 'vendor':
      return { companyLabel: 'Company', positionLabel: 'Position' };
    case 'school':
      return { companyLabel: 'School/Institution', positionLabel: 'Subject/Role' };
    case 'personal':
    default:
      return { companyLabel: 'Organization', positionLabel: 'Role' };
  }
};
