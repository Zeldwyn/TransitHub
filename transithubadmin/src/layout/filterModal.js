import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, MenuItem } from '@mui/material';
import '../pages/styles/style.css';
const FilterModal = ({ open, onClose, onApply }) => {
    const [userType, setUserType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleApply = () => {
        onApply({ userType, startDate, endDate });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Filter Users</DialogTitle>
            <DialogContent>
                <TextField
                    select
                    label="User Type"
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    fullWidth
                    margin="normal"
                >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="operator">Operator</MenuItem>
                    <MenuItem value="owner">Owner</MenuItem>
                </TextField>
                <TextField
                    type="date"
                    label="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    type="date"
                    label="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleApply} color="primary">Apply</Button>
            </DialogActions>
        </Dialog>
    );
};

export default FilterModal;
