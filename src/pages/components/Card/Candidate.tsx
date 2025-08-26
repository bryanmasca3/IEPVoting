import {
  Card,
  CardContent,  
  Typography,
  Box,
  useTheme
} from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import profileImage from './../../assets/photo.jpg';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

const Candidate = ({candidate,handle,isVoted}) => {    
    const theme = useTheme();
    return (
        <Card key={candidate.id} onClick={() => handle(candidate)} sx={{
                backgroundColor: isVoted? theme.palette.primary[800]: theme.palette.primary[600],
                border: isVoted
                ? `3px solid ${theme.palette.secondary.main}`
                : `3px solid ${theme.palette.primary.main}`,
            }}>
            <CardContent
            className={`flex flex-col items-center gap-4  cursor-pointer`}>
               {candidate.users.photo===''?<Box
                    component="img"
                    alt="profile"
                    src={profileImage}
                    height="200px"
                    width="200px"
                    borderRadius="50%"
                    sx={{ objectFit: 'cover' }}
                />
                        : <Box
                        component="img"
                        alt="profile"
                        src={candidate.users.photo}
                        height="200px"
                        width="200px"
                        borderRadius="50%"
                        sx={{ objectFit: 'cover' }}
                        />  }
                    <Typography variant="h3" className=" text-7xl uppercase text-center" sx={{
                        fontWeight:700
                    }}>                    
                        {candidate.users.first_name + ' ' + candidate.users.last_name}                
                    </Typography>
                    <Typography variant="h5" className="font-semibold">
                        Sede: <span className="font-normal capitalize">{candidate.users.sede}</span>
                    </Typography>
                    <Box>                      
                        {isVoted?<CheckBoxIcon sx={{ fontSize: 40 }} />:<CheckBoxOutlineBlankIcon  sx={{ fontSize: 40 }} />}
                    </Box>
            </CardContent>
        </Card>
    )
}

export default Candidate