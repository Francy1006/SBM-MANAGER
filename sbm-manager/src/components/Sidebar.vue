<template>
  <aside class="sidebar">
    <a href="#" class="brand">
      <i class="fas fa-cubes"></i>
      <span>SBM Manager</span>
    </a>
    <ul class="nav">
      <li><a href="#" class="active"><i class="fas fa-home"></i>Inicio</a></li>
      <li><a href="#"><i class="fas fa-users"></i>Usuarios</a></li>
      <li><a href="#"><i class="fas fa-chart-bar"></i>Reportes</a></li>
      <li><a href="#"><i class="fas fa-cog"></i>Configuración</a></li>
    </ul>
    <div class="user">
      <a href="#" class="dropdown-toggle" data-bs-toggle="dropdown">
        <img src="https://ui-avatars.com/api/?name=SBM+User&background=23272b&color=fff" alt="user" />
        <span>Usuario</span>
      </a>
      <ul class="dropdown-menu dropdown-menu-dark">
        <li><a class="dropdown-item" href="#"><i class="fas fa-user me-2"></i>Perfil</a></li>
        <li><a class="dropdown-item" href="#"><i class="fas fa-sign-out-alt me-2"></i>Salir</a></li>
      </ul>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar',
};
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background: #ffffff; /* fondo claro */
  color: #212529;       /* texto oscuro */
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  box-shadow: 2px 0 8px #0002;
  font-family: 'DINAlternate';
}
.brand {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  text-decoration: none;
  color: #e53935; /* rojo */
  font-size: 1.4rem;
  font-weight: bold;
}
.brand i {
  margin-right: 0.5rem;
}
.nav {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
}
.nav li {
  margin-bottom: 0.75rem;
}
.nav a {
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0.75rem;
  border-radius: 0.375rem;
  color: #212529; /* texto oscuro */
  opacity: 0.85;
  transition: background 0.3s, opacity 0.3s, color 0.3s;
  font-family: 'DINAlternate';
  font-weight: bold;
}
.nav a i {
  margin-right: 0.75rem;
}
.nav a:hover {
  background: #f5f5f5; /* hover claro */
  opacity: 1;
  color: #e53935;     /* rojo al pasar */
}
.nav a.active {
  background: #e53935; /* fondo activo rojo */
  color: #ffffff;      /* texto claro */
  opacity: 1;
}
.user {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
}
.user a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #212529;
  font-family: 'DINAlternate';
}
.user img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 0.5rem;
  border: 1px solid #dee2e6;
}

</style>

