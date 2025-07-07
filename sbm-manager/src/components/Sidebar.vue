<template>
  <aside class="d-flex flex-column flex-shrink-0 p-3 bg-light border-end" style="width: 220px; height: 100vh; position: fixed; left: 0; top: 0;">
    <a href="#" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-decoration-none">
      <span class="fs-4 fw-bold text-success">SBM</span>
    </a>
    <hr>
    <ul class="nav nav-pills flex-column mb-auto">
      <li class="nav-item mb-2">
        <a href="#" class="nav-link active" aria-current="page">
          <i class="bi bi-house-door me-2"></i>Inicio
        </a>
      </li>
      <li class="nav-item mb-2">
        <a href="#" class="nav-link text-dark">
          <i class="bi bi-people me-2"></i>Usuarios
        </a>
      </li>
      <li class="nav-item mb-2">
        <a href="#" class="nav-link text-dark">
          <i class="bi bi-bar-chart me-2"></i>Reportes
        </a>
      </li>
      <li class="nav-item">
        <a href="#" class="nav-link text-dark">
          <i class="bi bi-gear me-2"></i>Configuración
        </a>
      </li>
    </ul>
    <hr>
    <div class="dropdown">
      <a href="#" class="d-flex align-items-center text-dark text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
        <img src="https://ui-avatars.com/api/?name=SBM+User" alt="user" width="32" height="32" class="rounded-circle me-2">
        <strong>Usuario</strong>
      </a>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownUser1">
        <li><a class="dropdown-item" href="#">Perfil</a></li>
        <li><a class="dropdown-item" href="#">Salir</a></li>
      </ul>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar',
};
</script> 