<template>
  <div class="container-fluid py-4">
    <div class="row mb-4">
      <div class="col-md-4 mb-3">
        <div class="card shadow-sm border-0">
          <div class="card-body d-flex align-items-center">
            <div class="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width:48px;height:48px; background:#e53935!important;">
              <i class="fas fa-users fa-lg"></i>
            </div>
            <div>
              <h6 class="mb-0">Usuarios</h6>
              <h4 class="mb-0">124</h4>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4 mb-3">
        <div class="card shadow-sm border-0">
          <div class="card-body d-flex align-items-center">
            <div class="text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width:48px;height:48px; background:#e53935!important;">
              <i class="fas fa-chart-line fa-lg"></i>
            </div>
            <div>
              <h6 class="mb-0">Reportes</h6>
              <h4 class="mb-0">37</h4>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4 mb-3">
        <div class="card shadow-sm border-0">
          <div class="card-body d-flex align-items-center">
            <div class="text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width:48px;height:48px; background:#e53935!important;">
              <i class="fas fa-cogs fa-lg"></i>
            </div>
            <div>
              <h6 class="mb-0">Configuraciones</h6>
              <h4 class="mb-0">5</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row mb-4">
      <div class="col-lg-7 mb-4 mb-lg-0">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white border-0 fw-bold">Actividad semanal</div>
          <div class="card-body">
            <canvas id="barChart" height="120"></canvas>
          </div>
        </div>
      </div>
      <div class="col-lg-5">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-white border-0 fw-bold">Últimos usuarios</div>
          <div class="card-body p-0">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.email">
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span :class="['badge', user.active ? 'bg-danger' : 'bg-secondary']" :style="user.active ? 'background:#e53935!important;' : ''">
                      {{ user.active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      users: [
        { name: 'Juan Pérez', email: 'juan@example.com', active: true },
        { name: 'Ana Gómez', email: 'ana@example.com', active: false },
        { name: 'Carlos Ruiz', email: 'carlos@example.com', active: true },
        { name: 'Lucía Torres', email: 'lucia@example.com', active: true },
        { name: 'Pedro Díaz', email: 'pedro@example.com', active: false },
      ]
    };
  },
  mounted() {
    // Cargar gráfica de barras con Chart.js
    if (window.Chart) {
      const ctx = document.getElementById('barChart').getContext('2d');
      new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
          datasets: [{
            label: 'Reportes',
            data: [12, 19, 8, 15, 10, 7, 14],
            backgroundColor: '#e53935',
            borderRadius: 6
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }
  }
};
</script>

<!-- Chart.js CDN -->
<!-- Agrega esto en el index.html si no está --> 