// // app/page.tsx
// 'use client';
//
// import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';
// import labels from '@/constants/labels';
// import TaskForm from '@/app/features/tasks/components/TaskForm';
// import FilterSelect from '@/app/components/FilterSelect';
// import TaskBoard from '@/app/features/tasks/components/TaskBoard';
//
// export default function Home() {
//   return (
//     <>
//       <AppBar position="static">
//         <Toolbar>
//           <Typography variant="h6" component="div">
//             {labels.appTitle}
//           </Typography>
//         </Toolbar>
//       </AppBar>
//       <Container maxWidth="md" sx={{ mt: 4 }}>
//         <TaskForm />
//         <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
//           <FilterSelect />
//         </Box>
//         <TaskBoard />
//       </Container>
//     </>
//   );
// }
//
//
// app/page.tsx
'use client';

import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';
import labels from '@/constants/labels';
import Form from '@/app/components/Form';
import FilterSelect from '@/app/components/FilterSelect';
import List from '@/app/components/List';

export default function Home() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            {labels.appTitle}
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Form />
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <FilterSelect />
        </Box>
        <List />
      </Container>
    </>
  );
}
