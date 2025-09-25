'use client';

import { useState } from 'react';
import { Typography, Grid, Card, CardContent, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from 'next/link';

export default function FundsList({ groupedSchemes }) {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const fundHouses = Object.keys(groupedSchemes);

  return (
    <>
      {fundHouses.map((fundHouse) => (
        <Accordion key={fundHouse} expanded={expanded === fundHouse} onChange={handleChange(fundHouse)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{fundHouse}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {groupedSchemes[fundHouse].map((fund) => (
                <Grid item xs={12} sm={6} md={4} key={fund.scheme_code}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component={Link} href={`/scheme/${fund.scheme_code}`}>
                        {fund.scheme_name}
                      </Typography>
                      <Typography color="text.secondary">
                        Category: {fund.meta.scheme_category}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}