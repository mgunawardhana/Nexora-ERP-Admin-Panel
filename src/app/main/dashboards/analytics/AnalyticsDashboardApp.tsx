import FuseLoading from '@fuse/core/FuseLoading';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  BarController // Add this import
} from 'chart.js';
import { fetchAnalyzingPart } from '../../../axios/services/mega-city-services/common/CommonService';

// Update the registration to include BarController
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController // Add this registration
);

// Rest of your imports and interfaces remain the same

function HorizontalBarChart({ data, title = 'Horizontal Bar Chart' }: ChartComponentProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (chartRef.current && data) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      const chartData: ChartData<'bar'> = {
        labels: Object.keys(data).map(key => key.replace(/_/g, ' ')), // Format labels to be more readable
        datasets: [{
          label: 'Number of Employees',
          data: Object.values(data),
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }]
      };

      const options: ChartOptions<'bar'> = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Employees'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Role'
            }
          }
        }
      };

      chartInstance.current = new ChartJS(ctx, {
        type: 'bar',
        data: chartData,
        options
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, title]);

  return (
    <Box sx={{ position: 'relative', height: '400px', width: '100%' }}>
      <canvas ref={chartRef} />
    </Box>
  );
}

function AnalyticsDashboardApp() {
  const [employeeData, setEmployeeData] = useState<EmployeeRoleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetchAnalyzingPart();
        if (response && typeof response === 'object') {
          setEmployeeData(response);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <FuseLoading />;
  }

  return (
    <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Employee Role Distribution
              </Typography>
              {employeeData ? (
                <HorizontalBarChart
                  data={employeeData}
                  title="Employee Roles Overview"
                />
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px'
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No employee data available
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
    </Box>
  );
}

export default AnalyticsDashboardApp;