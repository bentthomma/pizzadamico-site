<?php
declare(strict_types=1);

function res_insert(array $data): void {
  $sql = 'INSERT INTO reservations (
    id, status, gcal_event_id, start_iso, end_iso,
    event_type, adults, children, veg_percent, toppings_json, setup_json,
    address, distance_km, name, email, phone, note,
    pricing_total, deposit_amount, confirm_token, cancel_token,
    created_at, updated_at, expires_at
  ) VALUES (
    :id, :status, :gcal_event_id, :start_iso, :end_iso,
    :event_type, :adults, :children, :veg_percent, :toppings_json, :setup_json,
    :address, :distance_km, :name, :email, :phone, :note,
    :pricing_total, :deposit_amount, :confirm_token, :cancel_token,
    :created_at, :updated_at, :expires_at
  )';
  $stmt = db_reservations()->prepare($sql);
  $stmt->execute([
    ':id'             => $data['id'],
    ':status'         => $data['status'],
    ':gcal_event_id'  => $data['gcal_event_id'],
    ':start_iso'      => $data['start_iso'],
    ':end_iso'        => $data['end_iso'],
    ':event_type'     => $data['event_type'],
    ':adults'         => $data['adults'],
    ':children'       => $data['children'],
    ':veg_percent'    => $data['veg_percent'],
    ':toppings_json'  => $data['toppings_json'],
    ':setup_json'     => $data['setup_json'],
    ':address'        => $data['address'],
    ':distance_km'    => $data['distance_km'],
    ':name'           => $data['name'],
    ':email'          => $data['email'],
    ':phone'          => $data['phone'],
    ':note'           => $data['note'],
    ':pricing_total'  => $data['pricing_total'],
    ':deposit_amount' => $data['deposit_amount'],
    ':confirm_token'  => $data['confirm_token'],
    ':cancel_token'   => $data['cancel_token'],
    ':created_at'     => $data['created_at'],
    ':updated_at'     => $data['updated_at'],
    ':expires_at'     => $data['expires_at'],
  ]);
}

function res_get(string $id): ?array {
  $stmt = db_reservations()->prepare('SELECT * FROM reservations WHERE id = ?');
  $stmt->execute([$id]);
  $row = $stmt->fetch();
  return $row ?: null;
}

function res_update_status(string $id, string $status, ?string $eventId = null): void {
  $now = date('c');
  $fields = ['status = :status', 'updated_at = :updated_at'];
  $params = [':status' => $status, ':updated_at' => $now, ':id' => $id];

  if ($status === 'confirmed') {
    $fields[] = 'confirmed_at = :confirmed_at';
    $params[':confirmed_at'] = $now;
  }
  if ($status === 'cancelled' || $status === 'expired') {
    $fields[] = 'cancelled_at = :cancelled_at';
    $params[':cancelled_at'] = $now;
  }
  if ($eventId !== null) {
    $fields[] = 'gcal_event_id = :gcal_event_id';
    $params[':gcal_event_id'] = $eventId;
  }

  $sql = 'UPDATE reservations SET ' . implode(', ', $fields) . ' WHERE id = :id';
  $stmt = db_reservations()->prepare($sql);
  $stmt->execute($params);
}

function res_pending_expired(): array {
  $stmt = db_reservations()->prepare(
    "SELECT * FROM reservations WHERE status = 'pending' AND expires_at < ?"
  );
  $stmt->execute([date('c')]);
  return $stmt->fetchAll();
}
